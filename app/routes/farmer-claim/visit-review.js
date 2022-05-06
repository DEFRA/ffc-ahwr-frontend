const boom = require('@hapi/boom')
const { getClaim } = require('../../session')

module.exports = {
  method: 'GET',
  path: '/farmer-claim/visit-review',
  options: {
    handler: async (request, h) => {
      const claim = getClaim(request)

      console.log('claim', claim)
      if (!claim) {
        return boom.notFound()
      }
      const claimData = claim.data
      const vetVisit = claim.vetVisit.data

      // TODO: payment amount needs to be looked up and probably added at the point of the farmer-apply in case it changes later on
      const paymentAmount = 543
      const rows = [
        { key: { text: 'Business name:' }, value: { text: claimData.organisation.name } },
        { key: { text: 'Date of review:' }, value: { text: new Date(vetVisit.visitDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) } },
        { key: { text: 'Payment amount:' }, value: { text: `£${paymentAmount}` } }
      ]
      return h.view('farmer-claim/visit-review', { listData: { rows }, email: claimData.organisation.email })
    }
  }
}
