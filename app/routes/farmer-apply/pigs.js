const Joi = require('joi')
const { cacheKeys } = require('../../config/constants')
const { getYesNoRadios } = require('../helpers')

const legendText = 'Do you keep more than 50 pigs?'
const radioId = 'pigs'
const errorText = 'Select yes if you keep more than 50 pigs'
const backLink = '/farmer-apply/sheep'

module.exports = [
  {
    method: 'GET',
    path: '/farmer-apply/pigs',
    options: {
      handler: async (request, h) => {
        return h.view('farmer-apply/pigs', {
          ...getYesNoRadios(legendText, radioId, request.yar.get(cacheKeys.pigs)),
          backLink
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/farmer-apply/pigs',
    options: {
      validate: {
        payload: Joi.object({
          pigs: Joi.string().valid('yes', 'no').required()
        }),
        failAction: (request, h, err) => {
          return h.view('farmer-apply/pigs', {
            ...getYesNoRadios(legendText, radioId, request.yar.get(cacheKeys.pigs), errorText),
            backLink
          }).takeover()
        }
      },
      handler: async (request, h) => {
        request.yar.set(cacheKeys.pigs, request.payload.pigs)
        return h.redirect('/farmer-apply/check-answers')
      }
    }
  }
]
