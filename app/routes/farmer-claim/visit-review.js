const boom = require('@hapi/boom')
const session = require('../../session')

module.exports = {
  method: 'GET',
  path: '/farmer-claim/visit-review',
  options: {
    handler: async (request, h) => {
      const claimData = session.getClaim(request)
      if (!claimData) {
        return boom.notFound()
      }

      // TODO: payment amount needs to be looked up and probably added at the point of the farmer-apply in case it changes later on
      const paymentAmount = 543
      const { vetVisit } = claimData
      const rows = [
        { key: { text: 'Business name:' }, value: { text: claimData.data.organisation.name } },
        { key: { text: 'Date of review:' }, value: { text: new Date(vetVisit.data.visitDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) } },
        { key: { text: 'Payment amount:' }, value: { text: `£${paymentAmount}` } }
      ]
      return h.view('farmer-claim/visit-review', { listData: { rows } })
    }
  }
}
