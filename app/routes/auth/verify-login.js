const Joi = require('joi')
const { getByEmail } = require('../../api-requests/users')
const { setOrganisation } = require('../../session')

async function cacheUserData (request, email) {
  const organisation = await getByEmail(email)
  Object.entries(organisation).forEach(([k, v]) => setOrganisation(request, k, v))
}

function setAuthCookie (request, email, userType) {
  request.cookieAuth.set({ email, userType })
  console.log(`Logged in user of type '${userType}' with email '${email}'.`)
}

/**
 * Clear all tokens in the `magiclinkCache` associated to the email.
 *
 * @param {object} request object containing the `magiclinkCache`.
 * @param {string} emailAddress address to clear tokens from.
 */
async function clearCache (request, emailAddress) {
  const { magiclinkCache } = request.server.app
  const emailTokens = await magiclinkCache.get(emailAddress)
  Promise.all(emailTokens.map(async (token) => await magiclinkCache.drop(token)))
  await magiclinkCache.drop(emailAddress)
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

      const { email: cachedEmail, redirectTo, userType } = await lookupToken(request, token)
      if (!cachedEmail || email !== cachedEmail) {
        return h.view('auth/verify-login-failed').code(400)
      }

      setAuthCookie(request, email, userType)

      await cacheUserData(request, email)

      await clearCache(request, email)

      return h.redirect(redirectTo)
    }
  }
}]
