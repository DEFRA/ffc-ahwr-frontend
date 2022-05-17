const Joi = require('joi')
const { getYesNoRadios } = require('../helpers/yes-no-radios')
const session = require('../../session')
const { vetVisitData: { beef } } = require('../../session/keys')

const legendText = 'Were there more than 10 beef cattle on the farm at the time of the review?'
const errorText = 'Select yes if you keep more than 10 beef cattle'
const backLink = '/vet/check-answers'

const path = 'vet/beef-eligibility'
module.exports = [
  {
    method: 'GET',
    path: `/${path}`,
    options: {
      handler: async (request, h) => {
        return h.view(path, {
          ...getYesNoRadios(legendText, beef, session.getVetVisitData(request, beef)),
          backLink
        })
      }
    }
  },
  {
    method: 'POST',
    path: `/${path}`,
    options: {
      validate: {
        payload: Joi.object({
          [beef]: Joi.string().valid('yes', 'no').required()
        }),
        failAction: (request, h, _err) => {
          return h.view(path, {
            ...getYesNoRadios(legendText, beef, session.getVetVisitData(request, beef), errorText),
            backLink
          }).takeover()
        }
      },
      handler: async (request, h) => {
        session.setVetVisitData(request, beef, request.payload[beef])
        return h.redirect('/vet/beef-test')
      }
    }
  }
]
