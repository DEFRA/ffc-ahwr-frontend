const { getEligibleOrgs } = require('../../api-requests/orgs')

module.exports = {
  method: 'GET',
  path: '/farmer-apply/declaration',
  options: {
    handler: async (request, h) => {
      // TODO: Get this data based on eligibility or the applicant
      const { sbi } = request.query
      const organisation = getEligibleOrgs().find(x => x.sbi === sbi)
      return h.view('farmer-apply/declaration', { organisation })
    }
  }
}
