const Joi = require('joi')
const { vetVisitData: { reviewReport } } = require('../../session/keys')
const { getYesNoRadios } = require('../helpers/yes-no-radios')
const session = require('../../session')

const legendText = 'Have you given the farmer a written report of the review?'
const radioId = 'reviewReport'
const errorText = 'Select yes if you have given the farmer a written report of the review'
const hintText = 'The report must include follow-up actions and recommendations. It will not be shared with Defra.'
const backLink = '/vet/sheep-test'
const radioOptions = { isPageHeading: true, legendClasses: 'govuk-fieldset__legend--l', inline: true, hintText }

module.exports = [
  {
    method: 'GET',
    path: '/vet/review-report',
    options: {
      handler: async (request, h) => {
        return h.view('vet/review-report', {
          ...getYesNoRadios(legendText, radioId, session.getVetVisitData(request, reviewReport), undefined, radioOptions),
          backLink
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/vet/review-report',
    options: {
      validate: {
        payload: Joi.object({
          reviewReport: Joi.string().valid('yes', 'no').required()
        }),
        failAction: (request, h, _err) => {
          return h.view('vet/review-report', {
            ...getYesNoRadios(legendText, radioId, session.getVetVisitData(request, reviewReport), errorText, radioOptions),
            backLink
          }).takeover()
        }
      },
      handler: async (request, h) => {
        session.setVetVisitData(request, reviewReport, request.payload.reviewReport)
        return h.redirect('/vet/check-answers')
      }
    }
  }
]
