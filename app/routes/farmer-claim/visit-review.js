const Joi = require('joi')
const boom = require('@hapi/boom')
const { getYesNoRadios } = require('../helpers/yes-no-radios')
const { getClaimAmount } = require('../../lib/get-claim-amount')
const { getSpeciesTestRowForDisplay, getTypeOfReviewRowForDisplay } = require('../../lib/display-helpers')
const { getClaim, setClaim } = require('../../session')
const { claim: { detailsCorrect } } = require('../../session/keys')

const errorMessage = 'Select yes if these details are correct'
const legendText = 'Are these details correct?'

const path = 'farmer-claim/visit-review'

function getRows (claim) {
  const claimData = claim.data
  const visitData = claim.vetVisit.data
  const paymentAmount = getClaimAmount(claimData)

  let rows = [
    { key: { text: 'Business name' }, value: { text: claimData.organisation.name } },
    { key: { text: 'Date of review' }, value: { text: new Date(visitData.visitDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) } },
    { key: { text: 'Vet name' }, value: { text: visitData.signup.name } },
    getTypeOfReviewRowForDisplay(claimData)
  ]

  rows = [...rows, ...getSpeciesTestRowForDisplay(claim)]
  rows.push({ key: { text: 'Payment amount' }, value: { text: `£${paymentAmount}` } })

  return rows
}

function getViewData (claim, errorText) {
  return {
    ...getYesNoRadios(legendText, detailsCorrect, claim[detailsCorrect], errorText, { isPageHeading: false, legendClasses: 'govuk-fieldset__legend--m', inline: true }),
    listData: { rows: getRows(claim) },
    email: claim.data.organisation.email
  }
}

module.exports = [{
  method: 'GET',
  path: `/${path}`,
  options: {
    handler: async (request, h) => {
      const claim = getClaim(request)

      if (!claim) {
        return boom.notFound()
      }

      return h.view(path, getViewData(claim))
    }
  }
},
{
  method: 'POST',
  path: `/${path}`,
  options: {
    validate: {
      payload: Joi.object({
        [detailsCorrect]: Joi.string().valid('yes', 'no').required()
      }),
      failAction: (request, h, _err) => {
        const claim = getClaim(request)
        return h.view(path, getViewData(claim, errorMessage)).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const answer = request.payload[detailsCorrect]
      setClaim(request, detailsCorrect, answer)
      if (answer === 'yes') {
        return h.redirect('/farmer-claim/submit-claim')
      }
      return h.redirect('/farmer-claim/details-incorrect')
    }
  }
}]
