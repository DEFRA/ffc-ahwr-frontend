const boom = require('@hapi/boom')
const util = require('util')
const { applicationRequestQueue, applicationRequestMsgType, applicationResponseQueue } = require('../../config')
const session = require('../../session')
const { sendMessage, receiveMessage } = require('../../messaging')

module.exports = {
  method: 'POST',
  path: '/farmer-apply/confirmation',
  options: {
    handler: async (request, h) => {
      const organisation = session.getOrganisation(request)
      session.setApplication(request, 'organisation', organisation)

      const application = session.getFarmerApplyData(request)
      await sendMessage(application, applicationRequestMsgType, applicationRequestQueue, { sessionId: request.yar.id })
      const response = await receiveMessage(request.yar.id, applicationResponseQueue)
      if (!response) {
        return boom.internal()
      }
      console.info('Response received:', util.inspect(response, false, null, true))

      return h.view('farmer-apply/confirmation', { reference: response?.applicationReference })
    }
  }
}
