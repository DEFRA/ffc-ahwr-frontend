const Joi = require('joi')
const { farmerApplyData: { whichReview } } = require('../../session/keys')
const { speciesRadios } = require('../helpers/species-radio')
const session = require('../../session')

const legendText = 'Which livestock do you want a review for?'
const radioId = 'whichReview'
const errorText = 'Select which livestock do you want a review for?'
const hintHtml = `<p>You can have one review each year for one type of livestock.</p>
<p>If you're eligible for more than one type of livestock, you must choose which one you want reviewed.</p>`
const backLink = '/farmer-apply/org-review'
const radioOptions = { isPageHeading: true, legendClasses: 'govuk-fieldset__legend--l', inline: false, hintHtml }

module.exports = [
  {
    method: 'GET',
    path: '/farmer-apply/which-review',
    options: {
      handler: async (request, h) => {
        return h.view('farmer-apply/which-review', {
          ...speciesRadios(legendText, radioId, session.getFarmerApplyData(request, whichReview), undefined, radioOptions),
          backLink
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/farmer-apply/which-review',
    options: {
      validate: {
        payload: Joi.object({
          whichReview: Joi.string().valid('sheep', 'pigs', 'dairy', 'beef').required()
        }),
        failAction: (request, h, _err) => {
          return h.view('farmer-apply/which-review', {
            ...speciesRadios(legendText, radioId, session.getFarmerApplyData(request, whichReview), errorText, radioOptions),
            backLink
          }).takeover()
        }
      },
      handler: async (request, h) => {
        session.setFarmerApplyData(request, whichReview, request.payload.whichReview)
        return h.redirect(`/farmer-apply/${request.payload.whichReview}-eligibility`)
      }
    }
  }
]
