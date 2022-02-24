const { v4: uuidv4 } = require('uuid')
const boom = require('@hapi/boom')
const { notify: { templateIdApplicationComplete } } = require('../../config')
const { getEligibleOrgs } = require('../../api-requests/orgs')
const sendEmail = require('../../lib/send-email')

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

      const result = await sendEmail(templateIdApplicationComplete, organisation.email, { personalisation: { name: organisation.name, reference }, reference })

      if (!result) {
        return boom.internal()
      }

      return h.view('farmer-apply/confirmation', { reference })
    }
  }
}
