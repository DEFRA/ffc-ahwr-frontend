const { getEligibleOrgs } = require('../../api-requests/orgs')

module.exports = {
  method: 'GET',
  path: '/farmer-apply/check-answers',
  options: {
    handler: async (request, h) => {
      // TODO: Get this data based on eligibility or the applicant
      const { sbi } = request.query
      const organisation = getEligibleOrgs().find(x => x.sbi === sbi)
      const rows = [{ key: { text: 'Livestock keeper' }, value: { text: 'Yes' } }]
      return h.view('farmer-apply/check-answers', { organisation, listData: { rows } })
    }
  }
}
