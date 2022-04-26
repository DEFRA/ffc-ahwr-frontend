const Joi = require('joi')
const { getByEmail } = require('../../api-requests/users')
const { farmerApply, farmerClaim, vet } = require('../../config/user-types')
const { getApplication } = require('../../messaging/application')
const { setFarmerClaimData, setOrganisation, setVetVisitData } = require('../../session')
const { vetVisitData: { farmerApplication, signup } } = require('../../session/keys')

function isRequestValid (cachedEmail, email) {
  return !cachedEmail || email !== cachedEmail
}

function setAuthCookie (request, email, userType) {
  request.cookieAuth.set({ email, userType })
  console.log(`Logged in user of type '${userType}' with email '${email}'.`)
}

async function cacheFarmerApplyData (request, email) {
  const organisation = await getByEmail(email)
  Object.entries(organisation).forEach(([k, v]) => setOrganisation(request, k, v))
}

async function cacheFarmerClaimData (request, email) {
  // TODO: get the vet_visit record and any additional data for the claim
  const data = {
    dataOfReview: '123456789',
    email,
    name: 'org-name',
    paymentAmount: 522
  }
  Object.entries(data).forEach(([k, v]) => setFarmerClaimData(request, k, v))
}

async function cacheVetData (request, vetSignupData) {
  setVetVisitData(request, signup, vetSignupData)
  const application = await getApplication(vetSignupData.reference, request.yar.id)
  setVetVisitData(request, farmerApplication, application)
}

/**
 * Clear all tokens in the `magiclinkCache` associated to the email.
 *
 * @param {object} request object containing the `magiclinkCache`.
 * @param {string} email address to clear tokens from.
 */
async function clearMagicLinkCache (request, email) {
  const { magiclinkCache } = request.server.app
  const emailTokens = await magiclinkCache.get(email)
  Promise.all(emailTokens.map(async (token) => await magiclinkCache.drop(token)))
  await magiclinkCache.drop(email)
}

/**
 * Returns the object associated to the token or an empty object if not found.
 *
 * @param {object} request object containing the `magiclinkCache`.
 * @param {token} token UUID to look up.
 * @return {object} value from cache or empty if token not found in cache.
 */
async function lookupToken (request, token) {
  const { magiclinkCache } = request.server.app
  return (await magiclinkCache.get(token)) ?? {}
}

module.exports = [{
  method: 'GET',
  path: '/verify-login',
  options: {
    auth: false,
    validate: {
      query: Joi.object({
        email: Joi.string().email(),
        token: Joi.string().uuid().required()
      }),
      failAction: async (_, h, error) => {
        console.error(error)
        return h.view('auth/verify-login-failed').code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { email, token } = request.query

      const { email: cachedEmail, redirectTo, userType, data } = await lookupToken(request, token)
      if (isRequestValid(cachedEmail, email)) {
        return h.view('auth/verify-login-failed').code(400)
      }

      setAuthCookie(request, email, userType)

      switch (userType) {
        case farmerApply:
          await cacheFarmerApplyData(request, email)
          break
        case farmerClaim:
          await cacheFarmerClaimData(request, email)
          break
        case vet:
          await cacheVetData(request, data)
          break
        default:
          throw new Error(`Unknow userType ${userType}`)
      }

      await clearMagicLinkCache(request, email)

      return h.redirect(redirectTo)
    }
  }
}]
