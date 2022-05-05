const boom = require('@hapi/boom')
const { getClaim } = require('../../session')
const amounts = require('../../constants/amounts')

// TODO: This will need refactoring when the changes to the farmer apply
// preventing multi species applications happen. Currently hardcoded to sheep.
function getAmount (claimData) {
  const { cattle, cattleType, pigs, sheep } = claimData
  if (cattle === 'yes') {
    if (cattleType === 'both' || cattleType === 'beef') {
      return amounts.beef
    } else if (cattleType === 'dairy') {
      return amounts.dairy
    }
  } else if (pigs === 'yes') {
    return amounts.pigs
  } else if (sheep === 'yes') {
    return amounts.sheep
  } else {
    throw new Error('Unexpected species combination detected')
  }
}

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

      const paymentAmount = getAmount(claimData)
      const rows = [
        { key: { text: 'Business name:' }, value: { text: claimData.organisation.name } },
        { key: { text: 'Date of review:' }, value: { text: new Date(vetVisit.visitDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) } },
        { key: { text: 'Payment amount:' }, value: { text: `£${paymentAmount}` } }
      ]
      return h.view('farmer-claim/visit-review', { listData: { rows }, email: claimData.organisation.email })
    }
  }
}
