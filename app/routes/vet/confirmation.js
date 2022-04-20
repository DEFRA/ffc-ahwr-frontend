const boom = require('@hapi/boom')
const { applicationRequestQueue, vetVisitRequestMsgType, applicationResponseQueue } = require('../../config')
const session = require('../../session')
const { sendMessage, receiveMessage } = require('../../messaging')
const util = require('util')

module.exports = {
  method: 'POST',
  path: '/vet/confirmation',
  options: {
    handler: async (request, h) => {
      const vetSignup = session.getVetSignup(request)
      session.setVetVisitData(request, 'sessionId', request.yar.id)
      session.setVetSignup(request, 'vetSignup', vetSignup)

      const getVetVisitData = session.getVetVisitData(request)
      sendMessage(getVetVisitData, vetVisitRequestMsgType, applicationRequestQueue, { sessionId: request.yar.id })
      const response = await receiveMessage(request.yar.id, applicationResponseQueue)
      if (!response) {
        return boom.internal()
      } else {
        console.info('Response received:', util.inspect(response, false, null, true))
      }

      return h.view('vet/confirmation', { reference: response?.applicationReference })
    }
  }
}
