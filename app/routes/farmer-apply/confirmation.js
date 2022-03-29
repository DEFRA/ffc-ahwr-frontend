const boom = require('@hapi/boom')
const { applicationRequestQueue, applicationRequestMsgType, applicationResponseQueue } = require('../../config')
const session = require('../../session')
const { sendMessage, receiveMessage } = require('../../messaging')
const util = require('util')

module.exports = {
  method: 'POST',
  path: '/farmer-apply/confirmation',
  options: {
    handler: async (request, h) => {
      const organisation = session.getOrganisation(request)
      session.setApplication(request, 'applicationId', '')
      session.setApplication(request, 'sessionId', request.yar.id)
      session.setApplication(request, 'organisation', organisation)

      const application = session.getApplication(request)
      sendMessage(application, applicationRequestMsgType, applicationRequestQueue, { sessionId: request.yar.id })
      const response = await receiveMessage(request.yar.id, applicationResponseQueue)
      if (!response) {
        return boom.internal()
      } else {
        console.info('Response received:', util.inspect(response, false, null, true))
      }

      return h.view('farmer-apply/confirmation', { reference: response?.applicationId })
    }
  }
}
