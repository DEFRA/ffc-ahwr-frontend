const boom = require('@hapi/boom')
const getYesNoRadios = require('../helpers/yes-no-radios')
const { getClaim } = require('../../session')
const { getClaimAmount } = require('../../lib/get-claim-amount')

const legendText = 'Are these details correct?'
const radioId = 'details-correct'

module.exports = [{
  method: 'GET',
  path: '/farmer-claim/visit-review',
  options: {
    handler: async (request, h) => {
      const claim = getClaim(request)

      if (!claim) {
        return boom.notFound()
      }
      const claimData = claim.data
      const vetVisit = claim.vetVisit.data

      const paymentAmount = getClaimAmount(claimData)
      const rows = [
        { key: { text: 'Business name' }, value: { text: claimData.organisation.name } },
        { key: { text: 'Date of review' }, value: { text: new Date(vetVisit.visitDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) } },
        { key: { text: 'Vet name' }, value: { text: vetVisit.signup.name } },
        // TODO: Refactor once single species per application changes are made
        { key: { text: 'Type of review' }, value: { text: 'TBC...' } },
        { key: { text: 'Payment amount' }, value: { text: `£${paymentAmount}` } }
      ]
      return h.view('farmer-claim/visit-review', {
        ...getYesNoRadios(legendText, radioId, claim.review),
        listData: { rows },
        email: claimData.organisation.email
      })
    }
  }
}]
