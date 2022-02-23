const { getEligibleOrgs } = require('../../api-requests/orgs')
const { v4: uuidv4 } = require('uuid')

module.exports = {
  method: 'GET',
  path: '/farmer-apply/confirmation',
  options: {
    handler: async (request, h) => {
      // TODO: Get this data based on eligibility or the applicant
      const { sbi } = request.query
      const organisation = getEligibleOrgs().find(x => x.sbi === sbi)
      // TODO: should the reference number be a particular format?
      const reference = uuidv4().split('-').shift().toLocaleUpperCase('en-GB')
      // TODO: send email via Notify
      return h.view('farmer-apply/confirmation', { reference })
    }
  }
}
