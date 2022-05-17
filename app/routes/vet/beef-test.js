const Joi = require('joi')
const { vetVisitData: { beefTest } } = require('../../session/keys')
const session = require('../../session')
const getYesNoInvestigateRadios = require('../helpers/yes-no-investigate-radios')

const errorText = 'Select yes if BVD was found in the herd'
const backLink = '/vet/check-answers'
const legendText = 'Did antibody test results show that BVD is in the herd?'
function getRadios (previousAnswer, _errorText) {
  return getYesNoInvestigateRadios(legendText, beefTest, previousAnswer, _errorText)
}

const path = 'vet/beef-test'
module.exports = [
  {
    method: 'GET',
    path: `/${path}`,
    options: {
      handler: async (request, h) => {
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
          [beefTest]: Joi.string().valid('yes', 'no', 'further investigation required').required()
        }),
        failAction: (request, h, _err) => {
          return h.view(path, {
            ...getRadios(session.getVetVisitData(request, beefTest), errorText),
            backLink
          }).takeover()
        }
      },
      handler: async (request, h) => {
        session.setVetVisitData(request, beefTest, request.payload[beefTest])
        return h.redirect('/vet/review-report')
      }
    }
  }
]