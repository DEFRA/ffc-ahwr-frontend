const Joi = require('joi')
const { cacheKeys: { answers } } = require('../../config/constants')
const getYesNoRadios = require('../helpers/yes-no-radios')
const session = require('../../session')

const legendText = 'Do you keep more than 20 sheep?'
const radioId = 'sheep'
const errorText = 'Select yes if you keep more than 20 sheep'

function getBackLink (request) {
  return session.getApplication(request, answers.cattle) === 'yes'
    ? '/farmer-apply/cattle-type'
    : '/farmer-apply/cattle'
}

module.exports = [
  {
    method: 'GET',
    path: '/farmer-apply/sheep',
    options: {
      handler: async (request, h) => {
        return h.view('farmer-apply/sheep', {
          ...getYesNoRadios(legendText, radioId, session.getApplication(request, answers.sheep)),
          backLink: getBackLink(request)
        })
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
          return h.view('farmer-apply/sheep', {
            ...getYesNoRadios(legendText, radioId, session.getApplication(request, answers.sheep), errorText),
            backLink: getBackLink(request)
          }).takeover()
        }
      },
      handler: async (request, h) => {
        session.setApplication(request, answers.sheep, request.payload.sheep)
        return h.redirect('/farmer-apply/pigs')
      }
    }
  }
]
