const Joi = require('joi')
const { getYesNoRadios } = require('../helpers/yes-no-radios')
const session = require('../../session')
const { vetVisitData: { dairy } } = require('../../session/keys')

const legendText = 'Were there 11 or more dairy cattle on the farm at the time of the review?'
const errorText = 'Select yes if there were 11 or more cattle in the herd'
const backLink = '/vet/visit-date'

const path = 'vet/dairy-eligibility'
module.exports = [
  {
    method: 'GET',
    path: `/${path}`,
    options: {
      handler: async (request, h) => {
        return h.view(path, {
          ...getYesNoRadios(legendText, dairy, session.getVetVisitData(request, dairy)),
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
          [dairy]: Joi.string().valid('yes', 'no').required()
        }),
        failAction: (request, h, _err) => {
          return h.view(path, {
            ...getYesNoRadios(legendText, dairy, session.getVetVisitData(request, dairy), errorText),
            backLink
          }).code(400).takeover()
        }
      },
      handler: async (request, h) => {
        session.setVetVisitData(request, dairy, request.payload[dairy])
        return h.redirect('/vet/dairy-test')
      }
    }
  }
]
