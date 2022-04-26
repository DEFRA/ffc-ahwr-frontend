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
        { key: { text: 'Business name:' }, value: { text: claimData.name } },
        { key: { text: 'Date of review:' }, value: { text: claimData.dataOfReview } },
        { key: { text: 'Payment amount:' }, value: { text: `£${claimData.paymentAmount}` } }
      ]
      return h.view('farmer-claim/visit-review', { listData: { rows } })
    }
  }
}
