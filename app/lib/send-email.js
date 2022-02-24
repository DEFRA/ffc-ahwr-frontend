const notifyClient = require('./notifyClient')

module.exports = async (templateId, email, options) => {
  let success = true
  try {
    await notifyClient.sendEmail(templateId, email, options)
  } catch (e) {
    success = false
    console.error('Error occurred during sending email', e.response.data)
  }
  return success
}
