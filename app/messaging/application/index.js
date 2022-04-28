const { sendMessage, receiveMessage } = require('../')
const { applicationRequestQueue, fetchApplicationRequestMsgType, fetchClaimRequestMsgType, applicationResponseQueue } = require('../../config')

function getApplication (applicationReference, sessionId) {
  sendMessage({ applicationReference, sessionId }, fetchApplicationRequestMsgType, applicationRequestQueue, { sessionId })
  return receiveMessage(sessionId, applicationResponseQueue)
}

function getClaim (email, sessionId) {
  sendMessage({ email, sessionId }, fetchClaimRequestMsgType, applicationRequestQueue, { sessionId })
  return receiveMessage(sessionId, applicationResponseQueue)
}

module.exports = {
  getApplication,
  getClaim
}
