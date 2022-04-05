const { v4: uuid } = require('uuid')
const sendEmail = require('./send-email')
const { serviceUri } = require('../../config')

async function createAndCacheToken (request, email, redirectTo) {
  const { magiclinkCache } = request.server.app

  const token = uuid()
  const tokens = await magiclinkCache.get(email) ?? []
  tokens.push(token)
  await magiclinkCache.set(email, tokens)
  await magiclinkCache.set(token, { email, redirectTo })
  return token
}

/**
 * Send an email via GOV.UK Notify.
 * The templateId provided must have a `magiclink` variable for
 * personalisation. The magic link will be cached in the `magiclinkCache` cache
 * of the server (accessed via `request.server.app`). Once logged in the page
 * specified in `redirectTo` will be redirected to. There is no validation that
 * the route exists prior to sending the email.
 *
 * @param {object} request object containing the `magiclinkCache`.
 * @param {string} emailAddress address to send email to.
 * @param {string} templateId UUID of the email template with `magiclink`
 * variable set for personalisation.
 * @param {string} redirectTo the route to redirect the user to once logged in.
 */
module.exports = async (request, emailAddress, templateId, redirectTo) => {
  const token = await createAndCacheToken(request, emailAddress, redirectTo)

  return sendEmail(templateId, emailAddress, {
    personalisation: { magiclink: `${serviceUri}/verify-login?token=${token}&email=${emailAddress}` },
    reference: token
  })
}
