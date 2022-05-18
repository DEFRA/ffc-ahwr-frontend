const { applicationRequestQueue, submitClaimRequestMsgType, applicationResponseQueue } = require('../../config')
const { sendMessage, receiveMessage } = require('../../messaging')
const session = require('../../session')
const states = require('../../constants/states')

const path = 'farmer-claim/submit-claim'

module.exports = [{
  method: 'GET',
  path: `/${path}`,
  options: {
    handler: async (_, h) => {
      return h.view('farmer-claim/submit-claim')
    }
  }
},
{
  method: 'POST',
  path: `/${path}`,
  options: {
    handler: async (request, h) => {
      const claim = session.getClaim(request)
      const { reference } = claim

      const submission = { reference }
      await sendMessage(submission, submitClaimRequestMsgType, applicationRequestQueue, { sessionId: request.yar.id })
      const { state } = await receiveMessage(request.yar.id, applicationResponseQueue)

      switch (state) {
        case states.alreadyClaimed:
          return h.view('farmer-claim/already-claimed', { reference })
        case states.notFound:
          return h.view('farmer-claim/claim-not-found', { reference })
        case states.success:
          return h.view('farmer-claim/claim-success', { reference })
        default:
          return h.view('farmer-claim/claim-failed', { reference })
      }
    }
  }
}]
