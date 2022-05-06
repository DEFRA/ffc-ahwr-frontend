const Joi = require('joi')
const { vetVisitData: { beef } } = require('../../session/keys')
const getYesNoRadios = require('../helpers/yes-no-radios')
const session = require('../../session')

const legendText = 'Were there more than 10 beef cattle on the farm at the time of the review?'
const radioId = 'beef'
const errorText = 'Select yes if you keep more than 10 beef cattle'
const backLink = '/vet/which-review'

module.exports = [
  {
    method: 'GET',
    path: '/vet/beef-eligibility',
    options: {
      handler: async (request, h) => {
        return h.view('vet/beef-eligibility', {
          ...getYesNoRadios(legendText, radioId, session.getVetVisitData(request, beef)),
          backLink
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/vet/beef-eligibility',
    options: {
      validate: {
        payload: Joi.object({
          beef: Joi.string().valid('yes', 'no').required()
        }),
        failAction: (request, h, _err) => {
          return h.view('vet/beef-eligibility', {
            ...getYesNoRadios(legendText, radioId, session.getVetVisitData(request, beef), errorText),
            backLink
          }).takeover()
        }
      },
      handler: async (request, h) => {
        session.setVetVisitData(request, beef, request.payload.beef)
        return h.redirect('/vet/declaration')
      }
    }
  }
]
