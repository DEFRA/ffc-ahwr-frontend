const Joi = require('joi')
const { answers } = require('../../session/keys')
const session = require('../../session')

const backLink = '/farmer-apply/cattle'

function getRadios (previousAnswer, errorText) {
  const id = 'cattle-type'
  return {
    radios: {
      idPrefix: id,
      name: id,
      fieldset: {
        legend: {
          text: 'What type of cattle do you keep?',
          isPageHeading: true,
          classes: 'govuk-fieldset__legend--l'
        }
      },
      items: [
        {
          value: 'beef',
          text: 'Beef',
          checked: previousAnswer === 'beef'
        },
        {
          value: 'dairy',
          text: 'Dairy',
          checked: previousAnswer === 'dairy'
        },
        {
          divider: 'or'
        },
        {
          value: 'both',
          text: 'Both',
          checked: previousAnswer === 'both'
        }
      ],
      ...(errorText ? { errorMessage: { text: errorText } } : {})
    }
  }
}

module.exports = [
  {
    method: 'GET',
    path: '/farmer-apply/cattle-type',
    options: {
      handler: async (request, h) => {
        return h.view('farmer-apply/cattle-type', {
          ...getRadios(session.getApplication(request, answers.cattleType)),
          backLink
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/farmer-apply/cattle-type',
    options: {
      validate: {
        payload: Joi.object({
          'cattle-type': Joi.string().valid('beef', 'dairy', 'both').required()
        }),
        failAction: (request, h, err) => {
          const errorText = 'Select the type of cattle that you keep'
          return h.view('farmer-apply/cattle', {
            ...getRadios(session.getApplication(request, answers.cattleType), errorText),
            backLink
          }).takeover()
        }
      },
      handler: async (request, h) => {
        session.setApplication(request, answers.cattleType, request.payload['cattle-type'])
        return h.redirect('/farmer-apply/sheep')
      }
    }
  }
]
