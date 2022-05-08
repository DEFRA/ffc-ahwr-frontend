const boom = require('@hapi/boom')
const { getClaim } = require('../../session')
const { getClaimAmount } = require('../../lib/get-claim-amount')

module.exports = {
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
        { key: { text: 'Business name:' }, value: { text: claimData.organisation.name } },
        { key: { text: 'Date of review:' }, value: { text: new Date(vetVisit.visitDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) } },
        { key: { text: 'Payment amount:' }, value: { text: `£${paymentAmount}` } }
      ]
      return h.view('farmer-claim/visit-review', { listData: { rows }, email: claimData.organisation.email })
    }
  }
}
