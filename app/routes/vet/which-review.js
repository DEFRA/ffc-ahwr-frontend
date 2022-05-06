const Joi = require('joi')
const { vetVisitData: { whichReview } } = require('../../session/keys')
const session = require('../../session')

const backLink = '/vet/check-answers'

function getRadios (previousAnswer, errorText) {
  const id = 'which-review'
  return {
    radios: {
      idPrefix: id,
      name: id,
      fieldset: {
        legend: {
          text: 'Which livestock do you want a review for?',
          isPageHeading: true,
          classes: 'govuk-fieldset__legend--l',
          hint: {
            text: 'You can have one review each year for one type of livestock. If you are eligible for more than one type of livestock, choose which one you want reviewed.'
          }
        }
      },
      items: [
        {
          value: 'beef',
          text: 'Beef cattle',
          checked: previousAnswer === 'beef'
        },
        {
          value: 'dairy',
          text: 'Dairy cattle',
          checked: previousAnswer === 'dairy'
        },
        {
          value: 'sheep',
          text: 'Sheep',
          checked: previousAnswer === 'sheep'
        },
        {
          value: 'pigs',
          text: 'Pigs',
          checked: previousAnswer === 'pigs'
        }
      ],
      ...(errorText ? { errorMessage: { text: errorText } } : {})
    }
  }
}

module.exports = [
  {
    method: 'GET',
    path: '/vet/which-review',
    options: {
      handler: async (request, h) => {
        return h.view('vet/which-review', {
          ...getRadios(session.getVetVisitData(request, whichReview)),
          backLink
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/vet/which-review',
    options: {
      validate: {
        payload: Joi.object({
          'which-review': Joi.string().valid('beef', 'dairy', 'sheep', 'pigs').required()
        }),
        failAction: (request, h, _err) => {
          const errorText = 'Select the type of livestock that you keep'
          return h.view('vet/which-review', {
            ...getRadios(session.getVetVisitData(request, whichReview), errorText),
            backLink
          }).takeover()
        }
      },
      handler: async (request, h) => {
        session.setVetVisitData(request, whichReview, request.payload['which-review'])
        return h.redirect(`/vet/${request.payload['which-review']}-eligibility`)
      }
    }
  }
]
