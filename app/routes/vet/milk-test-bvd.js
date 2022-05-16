const Joi = require('joi')
const { vetVisitData: { milkTestBvdResult } } = require('../../session/keys')
const session = require('../../session')
const getYesNoInvestigateRadios = require('../helpers/yes-no-investigate-radios')

const errorText = 'Select yes if BVD was found in the herd'
const backLink = '/vet/check-answers'
const legendText = 'Did bulk milk test results show that BVD is in the herd?'
function getRadios (previousAnswer, _errorText) {
  return getYesNoInvestigateRadios(legendText, milkTestBvdResult, previousAnswer, _errorText)
}
module.exports = [
  {
    method: 'GET',
    path: '/vet/milk-test-bvd',
    options: {
      handler: async (request, h) => {
        return h.view('vet/milk-test-bvd', {
          ...getRadios(session.getVetVisitData(request, milkTestBvdResult)),
          backLink
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/vet/milk-test-bvd',
    options: {
      validate: {
        payload: Joi.object({
          milkTestBvdResult: Joi.string().valid('yes', 'no', 'further investigation required').required()
        }),
        failAction: (request, h, _err) => {
          return h.view('vet/milk-test-bvd', {
            ...getRadios(session.getVetVisitData(request, milkTestBvdResult), errorText),
            backLink
          }).takeover()
        }
      },
      handler: async (request, h) => {
        session.setVetVisitData(request, milkTestBvdResult, request.payload.milkTestBvdResult)
        return h.redirect('/vet/review-report')
      }
    }
  }
]
