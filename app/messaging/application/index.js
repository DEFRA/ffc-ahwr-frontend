const { sendMessage, receiveMessage } = require('../')
const { applicationRequestQueue, fetchApplicationRequestMsgType, fetchClaimRequestMsgType, applicationResponseQueue } = require('../../config')

function getApplication (applicationReference, sessionId) {
  sendMessage({ applicationReference }, fetchApplicationRequestMsgType, applicationRequestQueue, { sessionId })
  return receiveMessage(sessionId, applicationResponseQueue)
}

function getClaim (email, sessionId) {
  sendMessage({ email }, fetchClaimRequestMsgType, applicationRequestQueue, { sessionId })
  return receiveMessage(sessionId, applicationResponseQueue)
}

module.exports = {
  getApplication,
  getClaim
}
