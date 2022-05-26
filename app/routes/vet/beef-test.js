const Joi = require('joi')
const boom = require('@hapi/boom')
const { vetVisitData: { beefTest, farmerApplication } } = require('../../session/keys')
const session = require('../../session')
const { getYesNoRadios } = require('../helpers/yes-no-radios')
const species = require('../../constants/species')

const errorText = 'Select yes if BVD was found in the herd'
const backLink = '/vet/check-answers'
const legendText = 'Did antibody test results show that BVD is in the herd?'
function getRadios (previousAnswer, _errorText) {
  return getYesNoRadios(legendText, beefTest, previousAnswer, _errorText)
}

const path = 'vet/beef-test'
module.exports = [
  {
    method: 'GET',
    path: `/${path}`,
    options: {
      handler: async (request, h) => {
        const application = session.getVetVisitData(request, farmerApplication)
        if (application.data.whichReview !== species.beef) throw boom.badRequest()
        return h.view(path, {
          ...getRadios(session.getVetVisitData(request, beefTest)),
          backLink
        })
      }
    }
  },
  {
    method: 'POST',
    path: `/${path}`,
    options: {
      validate: {
        payload: Joi.object({
          [beefTest]: Joi.string().valid('yes', 'no').required()
        }),
        failAction: (request, h, _err) => {
          return h.view(path, {
            ...getRadios(session.getVetVisitData(request, beefTest), errorText),
            backLink
          }).code(400).takeover()
        }
      },
      handler: async (request, h) => {
        const application = session.getVetVisitData(request, farmerApplication)
        if (application.data.whichReview !== species.beef) throw boom.badRequest()
        session.setVetVisitData(request, beefTest, request.payload[beefTest])
        return h.redirect('/vet/review-report')
      }
    }
  }
]
