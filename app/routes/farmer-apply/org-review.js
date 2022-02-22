const { getEligibleOrgs } = require('../../api-requests/orgs')

module.exports = {
  method: 'GET',
  path: '/farmer-apply/org-review',
  options: {
    handler: async (request, h) => {
      // TODO: Get this data based on eligibility or the applicant
      console.log(request.query)
      const { sbi } = request.query
      const organisation = getEligibleOrgs().find(x => x.sbi === sbi)
      console.log(organisation)
      return h.view('farmer-apply/org-review', { organisation })
    }
  }
}
