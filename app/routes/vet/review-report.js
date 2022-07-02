const Joi = require('joi')
const { getClaimType } = require('../../lib/get-claim-type')
const { vetVisitData: { reviewReport, farmerApplication } } = require('../../session/keys')
const { getYesNoRadios } = require('../helpers/yes-no-radios')
const session = require('../../session')

const legendText = 'Have you given the farmer a written report of the review?'
const errorText = 'Select yes if you have given the farmer a written report of the review'
const hintText = 'The report must include follow-up actions and recommendations. It will not be shared with Defra.'
const radioOptions = { isPageHeading: true, legendClasses: 'govuk-fieldset__legend--l', inline: false, hintText }

module.exports = [
  {
    method: 'GET',
    path: '/vet/review-report',
    options: {
      handler: async (request, h) => {
        const application = session.getVetVisitData(request, farmerApplication)
        const claimType = getClaimType(application.data)
        const backLink = `/vet/${claimType}-test`
        return h.view('vet/review-report', {
          ...getYesNoRadios(legendText, reviewReport, session.getVetVisitData(request, reviewReport), undefined, radioOptions),
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
          [reviewReport]: Joi.string().valid('yes', 'no').required()
        }),
        failAction: (request, h, _err) => {
          const application = session.getVetVisitData(request, farmerApplication)
          const claimType = getClaimType(application.data)
          const backLink = `/vet/${claimType}-test`
          return h.view('vet/review-report', {
            ...getYesNoRadios(legendText, reviewReport, session.getVetVisitData(request, reviewReport), errorText, radioOptions),
            backLink
          }).code(400).takeover()
        }
      },
      handler: async (request, h) => {
        const answer = request.payload[reviewReport]
        session.setVetVisitData(request, reviewReport, request.payload[reviewReport])
        if (answer === 'yes') {
          return h.redirect('/vet/check-answers')
        }
        return h.redirect('/vet/provide-report')
      }
    }
  }
]
