const Joi = require('joi')
const { vetVisitData: { vetBvdResult } } = require('../../session/keys')
const session = require('../../session')
const getYesNoInvestigateRadios = require('../helpers/yes-no-investigate-radios')

const id = 'bvdRresult'
const errorText = 'Select one option'
const backLink = '/vet/check-answers'
const legendText = 'Did antibody test results show that BVD is in the herd?'
function getRadios (previousAnswer, _errorText) {
  return getYesNoInvestigateRadios(legendText, id, previousAnswer, _errorText)
}
module.exports = [
  {
    method: 'GET',
    path: '/vet/cows-bvd-present-breeder',
    options: {
      handler: async (request, h) => {
        return h.view('vet/cows-bvd-present-breeder', {
          ...getRadios(session.getVetVisitData(request, vetBvdResult)),
          backLink
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/vet/cows-bvd-present-breeder',
    options: {
      validate: {
        payload: Joi.object({
          bvdRresult: Joi.string().valid('yes', 'no', 'further investigation required').required()
        }),
        failAction: (request, h, _err) => {
          return h.view('vet/cows-bvd-present-breeder', {
            ...getRadios(session.getVetVisitData(request, vetBvdResult), errorText),
            backLink
          }).takeover()
        }
      },
      handler: async (request, h) => {
        session.setVetVisitData(request, vetBvdResult, request.payload.bvdRresult)
        return h.redirect('/vet/declaration')
      }
    }
  }
]
