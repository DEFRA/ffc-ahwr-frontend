const Joi = require('joi')
const { cacheKeys } = require('../../config/constants')

function getRadios (errorText) {
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
          text: 'Beef'
        },
        {
          value: 'dairy',
          text: 'Dairy'
        },
        {
          divider: 'or'
        },
        {
          value: 'both',
          text: 'Both'
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
        return h.view('farmer-apply/cattle-type', getRadios())
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
          console.log(request.payload)
          const errorText = 'Select the type of cattle do you keep'
          return h.view('farmer-apply/cattle', getRadios(errorText)).takeover()
        }
      },
      handler: async (request, h) => {
        request.yar.set(cacheKeys.cattleType, request.payload['cattle-type'])
        return h.redirect('/farmer-apply/sheep')
      }
    }
  }
]
