const { farmerApplyData: { eligibleSpecies, whichReview } } = require('../../session/keys')
const session = require('../../session')
const content = require('../../constants/species-review-content')

module.exports = {
  method: 'GET',
  path: '/farmer-apply/check-answers',
  options: {
    handler: async (request, h) => {
      const eligible = session.getFarmerApplyData(request, eligibleSpecies)
      if (eligible !== 'yes') {
        return h.redirect('/farmer-apply/not-eligible')
      }
      const species = session.getFarmerApplyData(request, whichReview)
      const backLink = `/farmer-apply/${species}-eligibility`
      const rows = [
        {
          key: { text: 'Type of review' },
          value: { html: content[species].reviewType },
          actions: { items: [{ href: '/farmer-apply/which-review', text: 'Change', visuallyHiddenText: 'change livestock' }] }
        },
        {
          key: { text: 'Number of livestock' },
          value: { html: content[species].liveStockNumber },
          actions: { items: [{ href: backLink, text: 'Change', visuallyHiddenText: 'change livestock' }] }
        }
      ]

      return h.view('farmer-apply/check-answers', { listData: { rows }, backLink })
    }
  }
}
