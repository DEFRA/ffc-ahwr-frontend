const Joi = require('joi')
const { farmerApplyData: { sheep } } = require('../../session/keys')
const { getYesNoRadios } = require('../helpers/yes-no-radios')
const session = require('../../session')

const legendText = 'Will you have at least 21 sheep on the date of the review?'
const radioId = 'sheep'
const errorText = 'Select yes if you have at least 21 sheep on the date of the review'
const hintText = 'You are only eligible for funding if you are keeping more than 20 sheep at the registered site on the date the vet visits.'
const backLink = '/farmer-apply/which-review'
const radioOptions = { isPageHeading: true, legendClasses: 'govuk-fieldset__legend--l', inline: true, hintText }

module.exports = [
  {
    method: 'GET',
    path: '/farmer-apply/sheep-eligibility',
    options: {
      handler: async (request, h) => {
        return h.view('farmer-apply/sheep-eligibility', {
          ...getYesNoRadios(legendText, radioId, session.getFarmerApplyData(request, sheep), undefined, radioOptions),
          backLink
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/farmer-apply/sheep-eligibility',
    options: {
      validate: {
        payload: Joi.object({
          sheep: Joi.string().valid('yes', 'no').required()
        }),
        failAction: (request, h, _err) => {
          return h.view('farmer-apply/sheep-eligibility', {
            ...getYesNoRadios(legendText, radioId, session.getFarmerApplyData(request, sheep), errorText, radioOptions),
            backLink
          }).takeover()
        }
      },
      handler: async (request, h) => {
        session.setFarmerApplyData(request, sheep, request.payload.sheep)
        const redirect = request.payload.sheep === 'yes' ? 'check-answers' : 'not-eligible'
        return h.redirect(`/farmer-apply/${redirect}`)
      }
    }
  }
]
