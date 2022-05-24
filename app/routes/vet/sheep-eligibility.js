const Joi = require('joi')
const { vetVisitData: { sheep } } = require('../../session/keys')
const { getYesNoRadios } = require('../helpers/yes-no-radios')
const session = require('../../session')

const legendText = 'Were there 21 or more sheep on the farm at the time of the review?'
const errorText = 'Select yes if there were 21 or more sheep on the farm at the time of the review'
const backLink = '/vet/visit-date'

const path = 'vet/sheep-eligibility'
module.exports = [
  {
    method: 'GET',
    path: `/${path}`,
    options: {
      handler: async (request, h) => {
        return h.view(path, {
          ...getYesNoRadios(legendText, sheep, session.getVetVisitData(request, sheep)),
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
          [sheep]: Joi.string().valid('yes', 'no').required()
        }),
        failAction: (request, h, _err) => {
          return h.view(path, {
            ...getYesNoRadios(legendText, sheep, session.getVetVisitData(request, sheep), errorText),
            backLink
          }).code(400).takeover()
        }
      },
      handler: async (request, h) => {
        session.setVetVisitData(request, sheep, request.payload[sheep])
        return h.redirect('/vet/sheep-test')
      }
    }
  }
]
