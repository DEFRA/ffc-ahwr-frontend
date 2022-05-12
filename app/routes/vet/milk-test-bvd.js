const Joi = require('joi')
const { vetVisitData: { milkTestBvdResult } } = require('../../session/keys')
const session = require('../../session')

const id = 'milkTestBvdResult'
const errorText = 'Select one option'
const backLink = '/vet/check-answers'

function getRadios (previousAnswer, _errorText) {
  return {
    radios: {
      idPrefix: id,
      name: id,
      fieldset: {
        legend: {
          text: 'Did bulk milk test results show that BVD is in the herd?',
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
    path: '/vet/milk-test-bvd',
    options: {
      handler: async (request, h) => {
        return h.view('vet/milk-test-bvd', {
          ...getRadios(session.getVetVisitData(request, milkTestBvdResult)),
          backLink
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/vet/milk-test-bvd',
    options: {
      validate: {
        payload: Joi.object({
          milkTestBvdResult: Joi.string().valid('yes', 'no', 'further investigation required').required()
        }),
        failAction: (request, h, _err) => {
          return h.view('vet/milk-test-bvd', {
            ...getRadios(session.getVetVisitData(request, milkTestBvdResult), errorText),
            backLink
          }).takeover()
        }
      },
      handler: async (request, h) => {
        session.setVetVisitData(request, milkTestBvdResult, request.payload[id])
        return h.redirect('/vet/declaration')
      }
    }
  }
]
