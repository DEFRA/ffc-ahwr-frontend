const Joi = require('joi')
const { getByEmail } = require('../../api-requests/orgs')
const { setOrganisation } = require('../../session')

module.exports = [{
  method: 'GET',
  path: '/verify-login',
  options: {
    auth: false,
    validate: {
      query: Joi.object({
        email: Joi.string().email(),
        token: Joi.string().uuid()
      }),
      failAction: async (_, h, error) => {
        console.error(error)
        return h.view('auth/verify-login-failed').code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { email, token } = request.query

      const { magiclinkCache } = request.server.app
      const tokens = await magiclinkCache.get(email)
      if (!tokens?.find(x => x === token)) {
        return h.view('auth/verify-login-failed')
      }

      const organisation = getByEmail(email)
      request.cookieAuth.set({ email })
      Object.entries(organisation).forEach(([k, v]) => setOrganisation(request, k, v))
      await magiclinkCache.drop(email)
      console.log(`Logged in user '${email}'.`)

      return h.redirect('farmer-apply/org-review')
    }
  }
}]
