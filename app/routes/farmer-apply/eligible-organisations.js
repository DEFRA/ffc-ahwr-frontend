const { getEligibleOrgs } = require('../../api-requests/orgs')

module.exports = {
  method: 'GET',
  path: '/farmer-apply/eligible-organisations',
  options: {
    handler: async (_, h) => {
      // TODO: Get this data based on eligibility
      const organisations = getEligibleOrgs()
      return h.view('farmer-apply/eligible-organisations', { organisations })
    }
  }
}
