const { v4: uuidv4 } = require('uuid')
const boom = require('@hapi/boom')
const { notify: { templateIdApplicationComplete }, applicationRequestQueue, applicationRequestMsgType, applicationResponseQueue } = require('../../config')
const sendEmail = require('../../lib/send-email')
const session = require('../../session')
const { sendMessage, receiveMessage } = require('../../messaging')
const util = require('util')

// TODO: Where should a GET request to the route go?
module.exports = {
  method: 'POST',
  path: '/farmer-apply/confirmation',
  options: {
    handler: async (request, h) => {
      // TODO: Get this data based on eligibility or the applicant
      // const { sbi } = request.payload
      const organisation = session.getOrganisation(request)
      // TODO: should the reference number be a particular format?
      const reference = uuidv4().split('-').shift().toLocaleUpperCase('en-GB')
      session.setApplication(request, 'applicationId', reference)
      session.setApplication(request, 'sessionId', request.yar.id)

      const application = session.getApplication(request)
      sendMessage(application, applicationRequestMsgType, applicationRequestQueue, { sessionId: request.yar.id })
      const response = await receiveMessage(request.yar.id, applicationResponseQueue)

      if (response) {
        console.info('Response received:', util.inspect(response, false, null, true))
      }
      // TODO: Check an email hasn't been sent already and store the fact that this has been sent
      const result = await sendEmail(templateIdApplicationComplete, organisation.email, { personalisation: { name: organisation.name, reference }, reference })

      if (!result) {
        return boom.internal()
      }

      return h.view('farmer-apply/confirmation', { reference })
    }
  }
}
