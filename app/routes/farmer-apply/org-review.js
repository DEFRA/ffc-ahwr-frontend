const { getEligibleOrgs } = require('../../api-requests/orgs')

module.exports = {
  method: 'GET',
  path: '/farmer-apply/org-review',
  options: {
    handler: async (request, h) => {
      // TODO: Get this data based on eligibility or the applicant
      const { sbi } = request.query
      const organisation = getEligibleOrgs().find(x => x.sbi === sbi)
      const rows = [
        { key: { text: 'SBI number:' }, value: { text: organisation.sbi } },
        { key: { text: 'CPH number:' }, value: { text: organisation.cph } },
        { key: { text: 'Address:' }, value: { text: organisation.address } },
        { key: { text: 'Contact email address:' }, value: { text: organisation.email } }
      ]
      return h.view('farmer-apply/org-review', { organisation, listData: { rows } })
    }
  }
}
