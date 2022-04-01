const notifyClient = require('./notify-client')

/**
 * Send an email via GOV.UK Notify.
 * Matches the `sendEmail` signature from
 * [Notify](https://docs.notifications.service.gov.uk/node.html#send-an-email-arguments)
 *
 * @param {string} templateId UUID of the email template.
 * @param {string} emailAddress address to send email to.
 * @param {object} options for personalisation, etc.
 */
module.exports = async (templateId, emailAddress, options) => {
  let success = true
  try {
    await notifyClient.sendEmail(templateId, emailAddress, options)
  } catch (e) {
    success = false
    console.error('Error occurred during sending email', e.response.data)
  }
  return success
}
