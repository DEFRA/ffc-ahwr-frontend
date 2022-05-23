const boom = require('@hapi/boom')
const session = require('../../session')
const Joi = require('joi')
const { farmerApplyData: { whichReview } } = require('../../session/keys')
const { speciesRadios } = require('../helpers/species-radio')
const radioId = 'whichReview'
const errorText = 'Select yes and confirm your details?'
const questionText = 'Are your details correct?'

function getView (request) {
  const organisation = session.getOrganisation(request)
  if (!organisation) {
    return boom.notFound()
  }

  const rows = [
    { key: { text: 'Farmer name:' }, value: { text: organisation.name } },
    { key: { text: 'Business name:' }, value: { text: organisation.name } },
    { key: { text: 'SBI number:' }, value: { text: organisation.sbi } },
    { key: { text: 'CPH number:' }, value: { text: organisation.cph } },
    { key: { text: 'Address:' }, value: { text: organisation.address } },
    { key: { text: 'Contact email address:' }, value: { text: organisation.email } }
  ]
  return { organisation, listData: { rows } }
}

module.exports = [{
  method: 'GET',
  path: '/farmer-apply/org-review',
  options: {
    handler: async (request, h) => {
      return h.view('farmer-apply/org-review', getView(request))
    }
  }
},
{
  method: 'POST',
  path: '/farmer-apply/org-review',
  options: {
    validate: {
      payload: Joi.object({
        whichReview: Joi.string().valid('yes', 'no').required()
      }),
      failAction: (request, h, _err) => {
        return h.view('/farmer-apply/org-review', {
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
