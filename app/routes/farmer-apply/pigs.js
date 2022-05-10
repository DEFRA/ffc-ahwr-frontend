const Joi = require('joi')
const { answers } = require('../../session/keys')
const getYesNoRadios = require('../helpers/yes-no-radios')
const session = require('../../session')

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
          ...getYesNoRadios(legendText, radioId, session.getApplication(request, answers.pigs)),
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
        failAction: (request, h, _err) => {
          return h.view('farmer-apply/pigs', {
            ...getYesNoRadios(legendText, radioId, session.getApplication(request, answers.pigs), errorText),
            backLink
          }).takeover()
        }
      },
      handler: async (request, h) => {
        session.setApplication(request, answers.pigs, request.payload.pigs)
        return h.redirect('/farmer-apply/check-answers')
      }
    }
  }
]
