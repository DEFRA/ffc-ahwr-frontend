const { sendMessage, receiveMessage } = require('../')
const { applicationRequestQueue, fetchApplicationRequestMsgType, applicationResponseQueue } = require('../../config')

function getApplication (applicationReference, sessionId) {
  sendMessage({ applicationReference, sessionId }, fetchApplicationRequestMsgType, applicationRequestQueue, { sessionId })
  return receiveMessage(sessionId, applicationResponseQueue)
}

module.exports = {
  getApplication
}
