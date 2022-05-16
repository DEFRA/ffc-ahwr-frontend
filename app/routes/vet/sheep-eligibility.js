const Joi = require('joi')
const { vetVisitData: { sheep } } = require('../../session/keys')
const { getYesNoRadios } = require('../helpers/yes-no-radios')
const session = require('../../session')

const legendText = 'Will you have at least 21 sheep on the date of the review?'
const errorText = 'Select yes if you have at least 21 sheep on the date of the review'
const backLink = '/vet/which-review'
const hintText = 'You are only eligible for funding if you are keeping more than 20 sheep at the registered site on the date the vet visits.'
const radioOptions = { isPageHeading: true, legendClasses: 'govuk-fieldset__legend--l', inline: true, hintText }

module.exports = [
  {
    method: 'GET',
    path: '/vet/sheep-eligibility',
    options: {
      handler: async (request, h) => {
        return h.view('vet/sheep-eligibility', {
          ...getYesNoRadios(legendText, sheep, session.getVetVisitData(request, sheep), undefined, radioOptions),
          backLink
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/vet/sheep-eligibility',
    options: {
      validate: {
        payload: Joi.object({
          [sheep]: Joi.string().valid('yes', 'no').required()
        }),
        failAction: (request, h, _err) => {
          return h.view('vet/sheep-eligibility', {
            ...getYesNoRadios(legendText, sheep, session.getVetVisitData(request, sheep), errorText, radioOptions),
            backLink
          }).takeover()
        }
      },
      handler: async (request, h) => {
        session.setVetVisitData(request, sheep, request.payload[sheep])
        return h.redirect('/vet/sheep-epg')
      }
    }
  }
]
