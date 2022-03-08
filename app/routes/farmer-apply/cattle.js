const Joi = require('joi')
const { cacheKeys } = require('../../config/constants')
const getYesNoRadios = require('../helpers/yes-no-radios')
const session = require('../../session')

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
          ...getYesNoRadios(legendText, radioId, session.getApplication(request, cacheKeys.cattle)),
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
            ...getYesNoRadios(legendText, radioId, session.getApplication(request, cacheKeys.cattle), errorText),
            backLink
          }).takeover()
        }
      },
      handler: async (request, h) => {
        session.setApplication(request, cacheKeys.cattle, request.payload.cattle)
        return request.payload.cattle === 'yes'
          ? h.redirect('/farmer-apply/cattle-type')
          : h.redirect('/farmer-apply/sheep')
      }
    }
  }
]
