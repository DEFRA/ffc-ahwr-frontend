const Joi = require('joi')
const boom = require('@hapi/boom')
const { vetVisitData: { dairyTest, farmerApplication } } = require('../../session/keys')
const session = require('../../session')
const { getYesNoRadios } = require('../helpers/yes-no-radios')
const species = require('../../constants/species')

const errorText = 'Select yes if BVD was found in the herd'
const backLink = '/vet/check-answers'
const legendText = 'Did testing results show that BVD is in the herd?'
function getRadios (previousAnswer, _errorText) {
  return getYesNoRadios(legendText, dairyTest, previousAnswer, _errorText)
}
const path = 'vet/dairy-test'
module.exports = [
  {
    method: 'GET',
    path: `/${path}`,
    options: {
      handler: async (request, h) => {
        const application = session.getVetVisitData(request, farmerApplication)
        if (application.data.whichReview !== species.dairy) throw boom.badRequest()
        return h.view(path, {
          ...getRadios(session.getVetVisitData(request, dairyTest)),
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
          [dairyTest]: Joi.string().valid('yes', 'no').required()
        }),
        failAction: (request, h, _err) => {
          return h.view(path, {
            ...getRadios(session.getVetVisitData(request, dairyTest), errorText),
            backLink
          }).code(400).takeover()
        }
      },
      handler: async (request, h) => {
        const application = session.getVetVisitData(request, farmerApplication)
        if (application.data.whichReview !== species.dairy) throw boom.badRequest()
        session.setVetVisitData(request, dairyTest, request.payload[dairyTest])
        return h.redirect('/vet/review-report')
      }
    }
  }
]
