const Joi = require('joi')
const { farmerApplyData: { dairy } } = require('../../session/keys')
const { getYesNoRadios } = require('../helpers/yes-no-radios')
const session = require('../../session')

const legendText = 'Will you have at least 11 dairy cattle on the date of the review?'
const radioId = 'dairy'
const errorText = 'Select yes if you have at least 11 dairy cattle on the date of the review'
const hintText = 'You are only eligible for funding if you are keeping more than 10 dairy cattle at the registered site on the date the vet visits.'
const backLink = '/farmer-apply/which-review'
const radioOptions = { isPageHeading: true, legendClasses: 'govuk-fieldset__legend--l', inline: true, hintText }

module.exports = [
  {
    method: 'GET',
    path: '/farmer-apply/dairy-eligibility',
    options: {
      handler: async (request, h) => {
        return h.view('farmer-apply/dairy-eligibility', {
          ...getYesNoRadios(legendText, radioId, session.getFarmerApplyData(request, dairy), undefined, radioOptions),
          backLink
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/farmer-apply/dairy-eligibility',
    options: {
      validate: {
        payload: Joi.object({
          dairy: Joi.string().valid('yes', 'no').required()
        }),
        failAction: (request, h, _err) => {
          return h.view('farmer-apply/dairy-eligibility', {
            ...getYesNoRadios(legendText, radioId, session.getFarmerApplyData(request, dairy), errorText, radioOptions),
            backLink
          }).takeover()
        }
      },
      handler: async (request, h) => {
        session.setFarmerApplyData(request, dairy, request.payload.dairy)
        const redirect = request.payload.dairy === 'yes' ? 'check-answers' : 'not-eligible'
        return h.redirect(`/farmer-apply/${redirect}`)
      }
    }
  }
]
