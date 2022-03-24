const Joi = require('joi')
const { getByEmail } = require('../../api-requests/users')
const { setOrganisation } = require('../../session')

async function cacheUserData (request, email) {
  const organisation = await getByEmail(email)
  Object.entries(organisation).forEach(([k, v]) => setOrganisation(request, k, v))
}

function setAuthCookie (request, email) {
  request.cookieAuth.set({ email })
  console.log(`Logged in user '${email}'.`)
}

async function clearCache (request, email) {
  const { magiclinkCache } = request.server.app
  const emailTokens = await magiclinkCache.get(email)
  Promise.all(emailTokens.map(async (token) => await magiclinkCache.drop(token)))
  await magiclinkCache.drop(email)
}

async function lookupToken (request, token) {
  const { magiclinkCache } = request.server.app
  return magiclinkCache.get(token)
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

      const cachedEmail = await lookupToken(request, token)
      if (!cachedEmail || email !== cachedEmail) {
        return h.view('auth/verify-login-failed').code(400)
      }

      setAuthCookie(request, email)

      await cacheUserData(request, email)

      await clearCache(request, email)

      return h.redirect('farmer-apply/org-review')
    }
  }
}]
