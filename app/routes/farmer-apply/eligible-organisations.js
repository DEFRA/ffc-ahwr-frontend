const { getOrgs } = require('../../api-requests/orgs')

module.exports = {
  method: 'GET',
  path: '/farmer-apply/eligible-organisations',
  options: {
    handler: async (_, h) => {
      // TODO: Get this data based on eligibility
      const organisations = getOrgs()
      const rows = organisations.map(org => {
        return [{ text: org.name }, { text: org.sbi }, { text: 0 }, { html: `<a href="/farmer-apply/org-review?sbi=${org.sbi}">View or start application</a>` }]
      })
      const tableData = {
        head: [{ text: 'Organisation' }, { text: 'SBI Number' }, { text: 'Applications' }, { text: '' }],
        rows
      }
      return h.view('farmer-apply/eligible-organisations', { orgsToShow: organisations.length > 0, tableData })
    }
  }
}
