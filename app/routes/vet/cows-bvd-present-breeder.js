const Joi = require('joi')
const { vetVisitData: { vetBvdResult } } = require('../../session/keys')
const getYesNoRadios = require('../helpers/yes-no-radios')
const session = require('../../session')

const legendText = 'Did antibody test results show that BVD is in the herd?'
const radioId = 'bvd-result'
const errorText = 'Select one option'
const backLink = '/vet/check-answers'

module.exports = [
  {
    method: 'GET',
    path: '/vet/cows-bvd-present-breeder',
    options: {
      handler: async (request, h) => {
        return h.view('vet/cows-bvd-present-breeder', {
          ...getYesNoRadios(legendText, radioId, session.getVetVisitData(request, vetBvdResult)),
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
          beef: Joi.string().valid('yes', 'no').required()
        }),
        failAction: (request, h, _err) => {
          return h.view('vet/cows-bvd-present-breeder', {
            ...getYesNoRadios(legendText, radioId, session.getVetVisitData(request, vetBvdResult), errorText),
            backLink
          }).takeover()
        }
      },
      handler: async (request, h) => {
        session.setVetVisitData(request, vetBvdResult, request.payload.beef)
        return h.redirect('/vet/declaration')
      }
    }
  }
]
