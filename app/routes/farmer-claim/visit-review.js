const boom = require('@hapi/boom')
const session = require('../../session')

module.exports = {
  method: 'GET',
  path: '/farmer-claim/visit-review',
  options: {
    handler: async (request, h) => {
      const claimData = session.getFarmerClaimData(request)
      if (!claimData) {
        return boom.notFound()
      }

      const rows = [
        { key: { text: 'Business name:' }, value: { text: claimData.businessName } },
        { key: { text: 'Date of review:' }, value: { text: new Date(claimData.dateOfReview).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) } },
        { key: { text: 'Payment amount:' }, value: { text: `£${claimData.paymentAmount}` } }
      ]
      return h.view('farmer-claim/visit-review', { listData: { rows } })
    }
  }
}
