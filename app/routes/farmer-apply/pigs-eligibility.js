const Joi = require('joi')
const { farmerApplyData: { pigs } } = require('../../session/keys')
const { getYesNoRadios } = require('../helpers/yes-no-radios')
const session = require('../../session')

const legendText = 'Will you have at least 51 pigs on the date of the review?'
const radioId = 'pigs'
const errorText = 'Select yes if you have at least 51 pigs on the date of the review'
const hintText = 'You are only eligible for funding if you are keeping more than 50 pigs at the registered site on the date the vet visits.'
const backLink = '/farmer-apply/which-review'
const radioOptions = { isPageHeading: true, legendClasses: 'govuk-fieldset__legend--l', inline: true, hintText }

module.exports = [
  {
    method: 'GET',
    path: '/farmer-apply/pigs-eligibility',
    options: {
      handler: async (request, h) => {
        return h.view('farmer-apply/pigs-eligibility', {
          ...getYesNoRadios(legendText, radioId, session.getFarmerApplyData(request, pigs), undefined, radioOptions),
          backLink
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/farmer-apply/pigs-eligibility',
    options: {
      validate: {
        payload: Joi.object({
          pigs: Joi.string().valid('yes', 'no').required()
        }),
        failAction: (request, h, _err) => {
          return h.view('farmer-apply/pigs-eligibility', {
            ...getYesNoRadios(legendText, radioId, session.getFarmerApplyData(request, pigs), errorText, radioOptions),
            backLink
          }).takeover()
        }
      },
      handler: async (request, h) => {
        session.setFarmerApplyData(request, pigs, request.payload.pigs)
        const redirect = request.payload.pigs === 'yes' ? 'check-answers' : 'not-eligible'
        return h.redirect(`/farmer-apply/${redirect}`)
      }
    }
  }
]
