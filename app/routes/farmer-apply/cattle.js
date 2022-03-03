const Joi = require('joi')
const { cacheKeys } = require('../../config/constants')
const { getYesNoRadios } = require('../helpers')

const legendText = 'Do you keep more than 10 cattle?'
const radioId = 'cattle'
const errorText = 'Select yes if you keep more than 10 cattle'
const backLink = '/farmer-apply/org-review'

module.exports = [
  {
    method: 'GET',
    path: '/farmer-apply/cattle',
    options: {
      handler: async (request, h) => {
        return h.view('farmer-apply/cattle', {
          ...getYesNoRadios(legendText, radioId, request.yar.get(cacheKeys.cattle)),
          backLink
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/farmer-apply/cattle',
    options: {
      validate: {
        payload: Joi.object({
          cattle: Joi.string().valid('yes', 'no').required()
        }),
        failAction: (request, h, err) => {
          return h.view('farmer-apply/cattle', {
            ...getYesNoRadios(legendText, radioId, request.yar.get(cacheKeys.cattle), errorText),
            backLink
          }).takeover()
        }
      },
      handler: async (request, h) => {
        request.yar.set(cacheKeys.cattle, request.payload.cattle)
        return request.payload.cattle === 'yes'
          ? h.redirect('/farmer-apply/cattle-type')
          : h.redirect('/farmer-apply/sheep')
      }
    }
  }
]
