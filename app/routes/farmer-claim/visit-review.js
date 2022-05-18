const Joi = require('joi')
const boom = require('@hapi/boom')
const { getYesNoRadios } = require('../helpers/yes-no-radios')
const { getClaimAmount } = require('../../lib/get-claim-amount')
const { getClaimType } = require('../../lib/get-claim-type')
const { getClaim, setClaim } = require('../../session')
const { claim: { detailsCorrect } } = require('../../session/keys')

const errorMessage = 'Select yes if the review details are correct'
const legendText = 'Are these details correct?'

const path = 'farmer-claim/visit-review'

function getTypeOfReviewForDisplay (claimData) {
  return {
    beef: 'Beef cattle',
    dairy: 'Dairy cattle',
    pigs: 'Pigs',
    sheep: 'Sheep'
  }[getClaimType(claimData)]
}

function getTypeOfReviewRowForDisplay (claimData) {
  return { key: { text: 'Type of review' }, value: { text: getTypeOfReviewForDisplay(claimData) } }
}

// TODO: update with the real content and set the answer from vet visit data
function getSpeciesTestRowForDisplay (claimData) {
  return {
    beef: { key: { text: 'BVD in herd' }, value: { text: 'Answer from vet visit goes here' } },
    dairy: { key: { text: 'BVD in herd' }, value: { text: 'Answer from vet visit goes here' } },
    pigs: { key: { text: 'PIGS found' }, value: { text: 'Answer from vet visit goes here' } },
    sheep: { key: { text: 'Sheep test blah' }, value: { text: 'Answer from vet visit goes here' } }
  }[getClaimType(claimData)]
}

function getRows (claim) {
  const claimData = claim.data
  const visitData = claim.vetVisit.data
  const paymentAmount = getClaimAmount(claimData)

  return [
    { key: { text: 'Business name' }, value: { text: claimData.organisation.name } },
    { key: { text: 'Date of review' }, value: { text: new Date(visitData.visitDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) } },
    { key: { text: 'Vet name' }, value: { text: visitData.signup.name } },
    getTypeOfReviewRowForDisplay(claimData),
    getSpeciesTestRowForDisplay(claimData),
    { key: { text: 'Payment amount' }, value: { text: `£${paymentAmount}` } }
  ]
}

function getViewData (claim, errorText) {
  const rows = getRows(claim)

  return {
    ...getYesNoRadios(legendText, detailsCorrect, claim[detailsCorrect], errorText, { isPageHeading: false, legendClasses: 'govuk-fieldset__legend--m', inline: false }),
    listData: { rows },
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
