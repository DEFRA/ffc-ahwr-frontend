const session = require('../../session')
const { farmerApplyData: { whichReview } } = require('../../session/keys')

module.exports = {
  method: 'GET',
  path: '/farmer-apply/not-eligible',
  options: {
    handler: async (request, h) => {
      const species = session.getFarmerApplyData(request, whichReview)
      const backLink = `/farmer-apply/${species}-eligibility`
      return h.view('farmer-apply/not-eligible', { backLink })
    }
  }
}
