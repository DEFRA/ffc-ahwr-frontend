const Joi = require('joi')
const { cacheKeys } = require('../../config/constants')
const { getYesNoRadios } = require('../helpers')

const legendText = 'Do you keep more than 20 sheep?'
const radioId = 'sheep'
const errorText = 'Select yes if you keep more than 20 sheep'

module.exports = [
  {
    method: 'GET',
    path: '/farmer-apply/sheep',
    options: {
      handler: async (request, h) => {
        return h.view('farmer-apply/sheep', getYesNoRadios(legendText, radioId))
      }
    }
  },
  {
    method: 'POST',
    path: '/farmer-apply/sheep',
    options: {
      validate: {
        payload: Joi.object({
          sheep: Joi.string().valid('yes', 'no').required()
        }),
        failAction: (request, h, err) => {
          return h.view('farmer-apply/sheep', getYesNoRadios(legendText, radioId, errorText)).takeover()
        }
      },
      handler: async (request, h) => {
        request.yar.set(cacheKeys.sheep, request.payload.sheep)
        return h.redirect('/farmer-apply/pigs')
      }
    }
  }
]
