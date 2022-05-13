const Joi = require('joi')
const { answers } = require('../../session/keys')
const { getYesNoRadios } = require('../helpers/yes-no-radios')
const session = require('../../session')

const legendText = 'Do you keep more than 10 cattle?'
const errorText = 'Select yes if you keep more than 10 cattle'
const backLink = '/farmer-apply/org-review'

module.exports = [
  {
    method: 'GET',
    path: '/farmer-apply/cattle',
    options: {
      handler: async (request, h) => {
        return h.view('farmer-apply/cattle', {
          ...getYesNoRadios(legendText, answers.cattle, session.getApplication(request, answers.cattle)),
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
          [answers.cattle]: Joi.string().valid('yes', 'no').required()
        }),
        failAction: (request, h, err) => {
          return h.view('farmer-apply/cattle', {
            ...getYesNoRadios(legendText, answers.cattle, session.getApplication(request, answers.cattle), errorText),
            backLink
          }).takeover()
        }
      },
      handler: async (request, h) => {
        session.setApplication(request, answers.cattle, request.payload[answers.cattle])
        return request.payload.cattle === 'yes'
          ? h.redirect('/farmer-apply/cattle-type')
          : h.redirect('/farmer-apply/sheep')
      }
    }
  }
]
