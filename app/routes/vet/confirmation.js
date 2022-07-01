const util = require('util')
const {
  applicationRequestQueue,
  vetVisitRequestMsgType,
  applicationResponseQueue
} = require('../../config')
const { sendMessage, receiveMessage } = require('../../messaging')
const session = require('../../session')
const { vetSignup: { applicationState: applicationStateKey } } = require(
  '../../session/keys'
)

const path = 'vet/confirmation'
module.exports = [{
  method: 'GET',
  path: `/${path}`,
  options: {
    auth: false,
    handler: async (request, h) => {
      const { applicationState, reference } = session.getVetSignup(request)
      return h.view(path, { applicationState, reference })
    }
  }
}, {
  method: 'POST',
  path: `/${path}`,
  options: {
    handler: async (request, h) => {
      const vetVisitData = session.getVetVisitData(request)
      await sendMessage(
        vetVisitData,
        vetVisitRequestMsgType,
        applicationRequestQueue,
        { sessionId: request.yar.id }
      )
      const response = await receiveMessage(
        request.yar.id,
        applicationResponseQueue
      )
      console.info(
        'Response received:',
        util.inspect(response, false, null, true)
      )
      session.setVetSignup(
        request,
        applicationStateKey,
        response?.applicationState
      )
      return h.view(path, {
        applicationState: response?.applicationState,
        reference: vetVisitData?.signup?.reference
      })
    }
  }
}]
