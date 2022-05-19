const Joi = require('joi')
const { farmerApplyData: { beef } } = require('../../session/keys')
const { getYesNoRadios } = require('../helpers/yes-no-radios')
const session = require('../../session')

const legendText = 'Will you have at least 11 beef cattle on the date of the review?'
const radioId = 'beef'
const errorText = 'Select yes if you have at least 11 beef cattle on the date of the review'
const hintText = 'You\'re only eligible for funding if you\'re keeping at least 11 beef cattle at the registered site on the date the vet visits.'
const backLink = '/farmer-apply/which-review'
const radioOptions = { isPageHeading: true, legendClasses: 'govuk-fieldset__legend--l', inline: true, hintText }

module.exports = [
  {
    method: 'GET',
    path: '/farmer-apply/beef-eligibility',
    options: {
      handler: async (request, h) => {
        return h.view('farmer-apply/beef-eligibility', {
          ...getYesNoRadios(legendText, radioId, session.getFarmerApplyData(request, beef), undefined, radioOptions),
          backLink
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/farmer-apply/beef-eligibility',
    options: {
      validate: {
        payload: Joi.object({
          beef: Joi.string().valid('yes', 'no').required()
        }),
        failAction: (request, h, _err) => {
          return h.view('farmer-apply/beef-eligibility', {
            ...getYesNoRadios(legendText, radioId, session.getFarmerApplyData(request, beef), errorText, radioOptions),
            backLink
          }).takeover()
        }
      },
      handler: async (request, h) => {
        session.setFarmerApplyData(request, beef, request.payload.beef)
        const redirect = request.payload.beef === 'yes' ? 'check-answers' : 'not-eligible'
        return h.redirect(`/farmer-apply/${redirect}`)
      }
    }
  }
]
