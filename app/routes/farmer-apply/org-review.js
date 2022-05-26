const boom = require('@hapi/boom')
const session = require('../../session')
const Joi = require('joi')
const { farmerApplyData: { confirmCheckDetails, organisation: organisationKey } } = require('../../session/keys')
const radioId = 'confirmCheckDetails'
const labelText = 'Are your details correct?'
function getYesNoRadios (previousAnswer, errorText) {
  return {
    radios: {
      idPrefix: radioId,
      name: radioId,
      fieldset: {
        legend: {
          text: labelText,
          isPageHeading: false,
          classes: 'govuk-fieldset__legend--m'
        }
      },
      items: [
        {
          value: 'yes',
          text: 'Yes',
          checked: previousAnswer === 'yes'
        },
        {
          value: 'no',
          text: 'No',
          checked: previousAnswer === 'no'
        }
      ],
      ...(errorText ? { errorMessage: { text: errorText } } : {})
    }
  }
}
function getView (request, errorText) {
  const organisation = session.getFarmerApplyData(request, organisationKey)
  if (!organisation) {
    return boom.notFound()
  }
  const prevAnswer = session.getFarmerApplyData(request, confirmCheckDetails)
  const rows = [
    { key: { text: 'Farmer name:' }, value: { text: organisation.farmerName } },
    { key: { text: 'Business name:' }, value: { text: organisation.name } },
    { key: { text: 'SBI number:' }, value: { text: organisation.sbi } },
    { key: { text: 'CPH number:' }, value: { text: organisation.cph } },
    { key: { text: 'Address:' }, value: { text: organisation.address } },
    { key: { text: 'Contact email address:' }, value: { text: organisation.email } }
  ]
  return { organisation, listData: { rows }, ...getYesNoRadios(prevAnswer, errorText) }
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
},
{
  method: 'POST',
  path: '/farmer-apply/org-review',
  options: {
    validate: {
      payload: Joi.object({
        confirmCheckDetails: Joi.string().valid('yes').required()
      }),
      failAction: (request, h, _err) => {
        return h.view('farmer-apply/org-review', {
          ...getView(request, 'Select yes and confirm your details')
        }).takeover()
      }
    },
    handler: async (request, h) => {
      session.setFarmerApplyData(request, confirmCheckDetails, request.payload.confirmCheckDetails)
      return h.redirect('/farmer-apply/which-review')
    }
  }
}
]
