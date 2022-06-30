const boom = require('@hapi/boom')
const Joi = require('joi')
const util = require('util')
const { applicationRequestQueue, applicationRequestMsgType, applicationResponseQueue } = require('../../config')
const species = require('../../constants/species')
const states = require('../../constants/states')
const { sendMessage, receiveMessage } = require('../../messaging')
const session = require('../../session')
const { farmerApplyData: { declaration, reference } } = require('../../session/keys')

const backLink = '/farmer-apply/check-answers'

function getSpeciesTestText (application) {
  switch (application.whichReview) {
    case species.beef:
      return 'allow a vet to test for BVD'
    case species.dairy:
      return 'allow a vet to test for BVD'
    case species.pigs:
      return 'allow a vet to test for PRRS'
    case species.sheep:
      return 'allow a vet to test for EPG percentage'
  }
}

function getSpeciesMinNumText (application) {
  switch (application.whichReview) {
    case species.beef:
      return 'you\'ll have at least 10 beef cattle at the time the vet does the review'
    case species.dairy:
      return 'you\'ll have at least 10 dairy cattle at the time the vet does the review'
    case species.pigs:
      return 'you\'ll have at least 50 pigs at the time the vet does the review'
    case species.sheep:
      return 'you\'ll have at least 20 sheep at the time the vet does the review'
  }
}

function getSpeciesApplicationText (application) {
  switch (application.whichReview) {
    case species.beef:
      return 'beef cattle'
    case species.dairy:
      return 'dairy cattle'
    case species.pigs:
      return 'pig'
    case species.sheep:
      return 'sheep'
  }
}

function getViewData (application) {
  return {
    organisation: application.organisation,
    minNumText: getSpeciesMinNumText(application),
    species: getSpeciesApplicationText(application),
    testText: getSpeciesTestText(application)
  }
}

const path = 'farmer-apply/declaration'
module.exports = [{
  method: 'GET',
  path: `/${path}`,
  options: {
    handler: async (request, h) => {
      const application = session.getFarmerApplyData(request)
      if (!application) {
        return boom.notFound()
      }
      const viewData = getViewData(application)
      session.setFarmerApplyData(request, reference, null)
      return h.view(path, { backLink, ...viewData })
    }
  }
}, {
  method: 'POST',
  path: `/${path}`,
  options: {
    validate: {
      payload: Joi.object({
        terms: Joi.string().valid('agree').required()
      }),
      failAction: async (request, h, _) => {
        const application = session.getFarmerApplyData(request)
        const viewData = getViewData(application)
        return h.view(path, { backLink, ...viewData, errorMessage: { text: 'Select I agree to the terms and conditions' } }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      let applicationReference = session.getFarmerApplyData(request, reference)

      if (!applicationReference) {
        session.setFarmerApplyData(request, declaration, true)

        const application = session.getFarmerApplyData(request)
        await sendMessage(application, applicationRequestMsgType, applicationRequestQueue, { sessionId: request.yar.id })
        const response = await receiveMessage(request.yar.id, applicationResponseQueue)
        applicationReference = response?.applicationReference
        console.info('Response received:', util.inspect(response, false, null, true))

        if (applicationReference) {
          session.setFarmerApplyData(request, reference, applicationReference)
        }

        if (response.applicationState === states.failed) {
          return boom.internal(`creating application was not successful, check application microservice for details. sessionId: ${request.yar.id}. application data: ${JSON.stringify(application)}`)
        }
      }

      return h.view('farmer-apply/confirmation', { reference: applicationReference })
    }
  }
}]
