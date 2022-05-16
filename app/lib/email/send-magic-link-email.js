const { v4: uuid } = require('uuid')
const sendEmail = require('./send-email')
const { serviceUri, testToken } = require('../../config')
const { notify: { templateIdFarmerApplyLogin, templateIdFarmerClaimLogin, templateIdVetLogin } } = require('../../config')
const { farmerApply, farmerClaim, vet } = require('../../config/user-types')
const { getByEmail } = require('../../api-requests/users')
async function getToken (email) {
  if (testToken) {
    const user = await getByEmail(email)
    if (user.isTest === 'yes') {
      return testToken
    }
  }
  return uuid()
}
async function createAndCacheToken (request, email, redirectTo, userType, data) {
  const { magiclinkCache } = request.server.app

  const token = await getToken(email)
  const tokens = await magiclinkCache.get(email) ?? []
  tokens.push(token)
  await magiclinkCache.set(email, tokens)
  await magiclinkCache.set(token, { email, redirectTo, userType, data })
  return token
}

/**
 * Send an email via GOV.UK Notify.
 * The templateId provided must have a `magiclink` variable for
 * personalisation. The magic link will be cached in the `magiclinkCache` cache
 * of the server (accessed via `request.server.app`). Once logged in, the page
 * specified in `redirectTo` will be redirected to. There is no validation that
 * the route exists prior to sending the email.
 *
 * @param {object} request object containing the `magiclinkCache`.
 * @param {string} email address to send email to.
 * @param {string} templateId UUID of the email template with `magiclink`
 * variable set for personalisation.
 * @param {string} redirectTo the route to redirect the user to once logged in.
 * @param {string} userType the type of user.
 * @param {object} data object containing data to cache.
 * @return {boolean} value indicating whether the email send was successful or
 * not.
 */
async function sendMagicLinkEmail (request, email, templateId, redirectTo, userType, data) {
  const token = await createAndCacheToken(request, email, redirectTo, userType, data)

  return sendEmail(templateId, email, {
    personalisation: { magiclink: `${serviceUri}/verify-login?token=${token}&email=${email}` },
    reference: token
  })
}

async function sendFarmerApplyLoginMagicLink (request, email) {
  return sendMagicLinkEmail(request, email, templateIdFarmerApplyLogin, 'farmer-apply/org-review', farmerApply)
}

async function sendFarmerClaimLoginMagicLink (request, email) {
  return sendMagicLinkEmail(request, email, templateIdFarmerClaimLogin, 'farmer-claim/visit-review', farmerClaim)
}

async function sendVetMagicLinkEmail (request, email, data) {
  return sendMagicLinkEmail(request, email, templateIdVetLogin, 'vet/visit-date', vet, data)
}

module.exports = {
  sendFarmerApplyLoginMagicLink,
  sendFarmerClaimLoginMagicLink,
  sendVetMagicLinkEmail
}
