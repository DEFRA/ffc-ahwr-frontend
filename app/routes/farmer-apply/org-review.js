const boom = require('@hapi/boom')
const session = require('../../session')
const Joi = require('joi')
const {
  farmerApplyData: { confirmCheckDetails, organisation: organisationKey }
} = require('../../session/keys')
const labelText = 'Are your details correct?'
const { getYesNoRadios } = require('../helpers/yes-no-radios')

function formatAddressForDisplay (organisation) {
  return organisation?.address.replaceAll(',', '<br>')
}

function getView (request, errorText) {
  const organisation = session.getFarmerApplyData(request, organisationKey)
  if (!organisation) {
    return boom.notFound()
  }
  const prevAnswer = session.getFarmerApplyData(request, confirmCheckDetails)
  const rows = [
    { key: { text: 'Farmer name' }, value: { text: organisation.farmerName } },
    { key: { text: 'Business name' }, value: { text: organisation.name } },
    { key: { text: 'SBI number' }, value: { text: organisation.sbi } },
    {
      key: { text: 'Address' },
      value: { html: formatAddressForDisplay(organisation) }
    }
  ]
  return {
    organisation,
    listData: { rows },
    ...getYesNoRadios(labelText, confirmCheckDetails, prevAnswer, errorText, {
      isPageHeading: false,
      classes: 'govuk-fieldset__legend--m'
    })
  }
}

module.exports = [{
  method: 'GET',
  path: '/farmer-apply/org-review',
  options: {
    handler: async (request, h) => {
      const organisation = session.getFarmerApplyData(request, organisationKey)
      if (!organisation) {
        return boom.notFound()
      }
      return h.view('farmer-apply/org-review', getView(request))
    }
  }
}, {
  method: 'POST',
  path: '/farmer-apply/org-review',
  options: {
    validate: {
      payload: Joi.object({
        [confirmCheckDetails]: Joi.string().valid('yes', 'no').required()
      }),
      failAction: (request, h, _err) => {
        return h.view('farmer-apply/org-review', getView(request)).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const answer = request.payload[confirmCheckDetails]
      if (answer === 'yes') {
        session.setFarmerApplyData(
          request,
          confirmCheckDetails,
          request.payload[confirmCheckDetails]
        )
        return h.redirect('/farmer-apply/which-review')
      }
      return h.view('farmer-apply/details-incorrect')
    }
  }
}]
