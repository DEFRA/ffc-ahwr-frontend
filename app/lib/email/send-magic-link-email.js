const { v4: uuid } = require('uuid')
const sendEmail = require('./send-email')
const { serviceUri } = require('../../config')

async function createAndCacheToken (request, emailAddress) {
  const { magiclinkCache } = request.server.app

  const token = uuid()
  const tokens = await magiclinkCache.get(emailAddress) ?? []
  tokens.push(token)
  await magiclinkCache.set(emailAddress, tokens)
  await magiclinkCache.set(token, emailAddress)
  return token
}

/**
 * Send an email via GOV.UK Notify.
 * The templateId provided must have a `magiclink` variable for personalisation.
 * The magic link will be cached in the `magiclinkCache` cache of the server (accessed via `request.server.app`).
 *
 * @param {object} request object containing the `magiclinkCache`.
 * @param {string} emailAddress address to send email to.
 * @param {string} templateId UUID of the email template with `magiclink` variable set for personalisation..
 */
module.exports = async (request, emailAddress, templateId) => {
  const token = await createAndCacheToken(request, emailAddress)

  return sendEmail(templateId, emailAddress, {
    personalisation: { magiclink: `${serviceUri}/verify-login?token=${token}&email=${emailAddress}` },
    reference: token
  })
}
