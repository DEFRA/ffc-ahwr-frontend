const Joi = require('joi')
const boom = require('@hapi/boom')
const session = require('../../session')
const { vetVisitData: { speciesTest, farmerApplication } } = require('../../session/keys')
const { epg: epgValidation } = require('../../../app/lib/validation/percentage')
const species = require('../../constants/species')

const path = 'vet/sheep-test'
module.exports = [{
  method: 'GET',
  path: `/${path}`,
  options: {
    handler: async (request, h) => {
      const application = session.getVetVisitData(request, farmerApplication)
      if (application.data.whichReview !== species.sheep) {
        throw boom.badRequest()
      }
      const testValue = session.getVetVisitData(request, speciesTest)
      return h.view(path, { speciesTest: testValue })
    }
  }
}, {
  method: 'POST',
  path: `/${path}`,
  options: {
    validate: {
      payload: Joi.object({
        [speciesTest]: epgValidation
      }),
      failAction: async (request, h, error) => {
        return h.view(path, { ...request.payload, errorMessage: { text: error.details[0].message } }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const application = session.getVetVisitData(request, farmerApplication)
      if (application.data.whichReview !== species.sheep) {
        throw boom.badRequest()
      }
      session.setVetVisitData(request, speciesTest, request.payload[speciesTest])
      return h.redirect('/vet/review-report')
    }
  }
}]
