const Joi = require('joi')
const { vetVisitData: { vetBvdResult } } = require('../../session/keys')
const session = require('../../session')

const id = 'bvdRresult'
const errorText = 'Select one option'
const backLink = '/vet/check-answers'
function getRadios (previousAnswer, _errorText) {
  return {
    radios: {
      idPrefix: id,
      name: id,
      fieldset: {
        legend: {
          text: 'Did antibody test results show that BVD is in the herd?',
          isPageHeading: true,
          classes: 'govuk-fieldset__legend--l'
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
        },
        {
          value: 'further investigation required',
          text: 'Further investigation required',
          checked: previousAnswer === 'further investigation required'
        }
      ],
      ...(errorText ? { errorMessage: { text: errorText } } : {})
    }
  }
}
module.exports = [
  {
    method: 'GET',
    path: '/vet/cows-bvd-present-breeder',
    options: {
      handler: async (request, h) => {
        return h.view('vet/cows-bvd-present-breeder', {
          ...getRadios(session.getVetVisitData(request, vetBvdResult)),
          backLink
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/vet/cows-bvd-present-breeder',
    options: {
      validate: {
        payload: Joi.object({
          bvdRresult: Joi.string().valid('yes', 'no', 'further investigation required').required()
        }),
        failAction: (request, h, _err) => {
          return h.view('vet/cows-bvd-present-breeder', {
            ...getRadios(session.getVetVisitData(request, vetBvdResult), errorText),
            backLink
          }).takeover()
        }
      },
      handler: async (request, h) => {
        session.setVetVisitData(request, vetBvdResult, request.payload.bvdRresult)
        return h.redirect('/vet/declaration')
      }
    }
  }
]
