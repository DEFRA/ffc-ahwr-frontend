const util = require('util')
const { applicationRequestQueue, vetVisitRequestMsgType, applicationResponseQueue } = require('../../config')
const session = require('../../session')
const { sendMessage, receiveMessage } = require('../../messaging')
const { vetSignup: { applicationState: applicationStateKey } } = require('../../session/keys')

module.exports = [{
  method: 'GET',
  path: '/vet/confirmation',
  options: {
    auth: false,
    handler: async (request, h) => {
      const { applicationState, reference } = session.getVetSignup(request)
      return h.view('vet/confirmation', { applicationState, reference })
    }
  }
}, {
  method: 'POST',
  path: '/vet/confirmation',
  options: {
    handler: async (request, h) => {
      session.setVetVisitData(request, 'sessionId', request.yar.id)
      const vetVisitData = session.getVetVisitData(request)
      sendMessage(vetVisitData, vetVisitRequestMsgType, applicationRequestQueue, { sessionId: request.yar.id })
      const response = await receiveMessage(request.yar.id, applicationResponseQueue)
      console.info('Response received:', util.inspect(response, false, null, true))
      session.setVetSignup(request, applicationStateKey, response?.applicationState)
      return h.view('vet/confirmation', { applicationState: response?.applicationState, reference: vetVisitData?.signup?.reference })
    }
  }
}]
