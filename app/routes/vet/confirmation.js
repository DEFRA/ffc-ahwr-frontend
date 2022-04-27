const util = require('util')
const { applicationRequestQueue, vetVisitRequestMsgType, applicationResponseQueue } = require('../../config')
const session = require('../../session')
const { sendMessage, receiveMessage } = require('../../messaging')
const { vetSignup: { reference: referenceKey } } = require('../../session/keys')

module.exports = [{
  method: 'GET',
  path: '/vet/confirmation',
  options: {
    auth: false,
    handler: async (request, h) => {
      const applicationReference = session.getVetSignup(request, referenceKey)
      return h.view('vet/confirmation', { reference: applicationReference })
    }
  }
}, {
  method: 'POST',
  path: '/vet/confirmation',
  options: {
    handler: async (request, h) => {
      session.setVetVisitData(request, 'sessionId', request.yar.id)
      const getVetVisitData = session.getVetVisitData(request)
      sendMessage(getVetVisitData, vetVisitRequestMsgType, applicationRequestQueue, { sessionId: request.yar.id })
      const response = await receiveMessage(request.yar.id, applicationResponseQueue)
      console.info('Response received:', util.inspect(response, false, null, true))
      session.setVetSignup(request, referenceKey, response?.signup?.reference)
      return h.view('vet/confirmation', { reference: response?.signup?.reference })
    }
  }
}]
