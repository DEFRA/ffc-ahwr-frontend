const Joi = require('joi')
const { vetVisitData: { dairyTest } } = require('../../session/keys')
const session = require('../../session')
const { getYesNoRadios } = require('../helpers/yes-no-radios')

const errorText = 'Select yes if BVD was found in the herd'
const backLink = '/vet/check-answers'
const legendText = 'Did antibody test results show that BVD is in the herd?'
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
          }).takeover()
        }
      },
      handler: async (request, h) => {
        session.setVetVisitData(request, dairyTest, request.payload[dairyTest])
        return h.redirect('/vet/review-report')
      }
    }
  }
]
