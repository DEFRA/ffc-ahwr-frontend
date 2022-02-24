const Joi = require('joi')
const { v4: uuidv4 } = require('uuid')
const boom = require('@hapi/boom')
const { notify: { templateIdApplicationComplete } } = require('../../config')
const { getEligibleOrgs } = require('../../api-requests/orgs')
const sendEmail = require('../../lib/send-email')

// TODO: Where should a GET request to the route go?
module.exports = {
  method: 'POST',
  path: '/farmer-apply/confirmation',
  options: {
    validate: {
      payload: Joi.object({
        sbi: Joi.string().pattern(/^\d{9}$/).required()
      }),
      failAction: () => {
        return boom.internal()
      }
    },
    handler: async (request, h) => {
      // TODO: Get this data based on eligibility or the applicant
      const { sbi } = request.payload
      const organisation = getEligibleOrgs().find(x => x.sbi === sbi)

      // TODO: should the reference number be a particular format?
      const reference = uuidv4().split('-').shift().toLocaleUpperCase('en-GB')

      // TODO: Check an email hasn't been sent already and store the fact that this has been sent
      const result = await sendEmail(templateIdApplicationComplete, organisation.email, { personalisation: { name: organisation.name, reference }, reference })

      if (!result) {
        return boom.internal()
      }

      return h.view('farmer-apply/confirmation', { reference })
    }
  }
}
