const Joi = require('joi')
const { getByEmail } = require('../../api-requests/users')
const { farmerApply, vet } = require('../../constants/user-types')
const { getApplication } = require('../../messaging/application')
const { setFarmerApplyData, setVetVisitData } = require('../../session')
const { farmerApplyData: { organisation: organisationKey }, vetVisitData: { farmerApplication, signup } } = require('../../session/keys')

function isRequestInvalid (cachedEmail, email) {
  return !cachedEmail || email !== cachedEmail
}

function setAuthCookie (request, email, userType) {
  request.cookieAuth.set({ email, userType })
  console.log(`Logged in user of type '${userType}' with email '${email}'.`)
}

async function cacheFarmerApplyData (request, email) {
  const organisation = await getByEmail(email)
  setFarmerApplyData(request, organisationKey, organisation)
}

async function cacheVetData (request, vetSignupData) {
  setVetVisitData(request, signup, vetSignupData)
  const application = await getApplication(vetSignupData.reference, request.yar.id)
  setVetVisitData(request, farmerApplication, application)
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
      if (isRequestInvalid(cachedEmail, email)) {
        return h.view('auth/verify-login-failed').code(400)
      }

      setAuthCookie(request, email, userType)

      switch (userType) {
        case farmerApply:
          await cacheFarmerApplyData(request, email)
          break
        case vet:
          await cacheVetData(request, data)
          break
      }

      return h.redirect(redirectTo)
    }
  }
}]
