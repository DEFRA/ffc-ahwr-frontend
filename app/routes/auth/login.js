const Joi = require('joi')
const { getOrgByReference } = require('../../api-requests/orgs')
const { cacheKeys } = require('../../config/constants')

module.exports = [{
  method: 'GET',
  path: '/login',
  options: {
    auth: {
      mode: 'try'
    },
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: async (request, h) => {
      if (request.auth.isAuthenticated) {
        return h.redirect(request.query?.next || '/farmer-apply/eligible-organisations')
      }
      return h.view('auth/beta-login')
    }
  }
}, {
  method: 'POST',
  path: '/login',
  options: {
    auth: {
      mode: 'try'
    },
    validate: {
      payload: Joi.object({
        reference: Joi.string().pattern(/^\d{4}$/).required(),
        sbi: Joi.string().pattern(/^\d{9}$/).required()
      }),
      failAction: async (request, h, error) => {
        console.error(error)
        return h.view('auth/beta-login', { ...request.payload, errors: error }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { callerId, crn } = request.payload
      const sid = uuidv4()
      request.cookieAuth.set({ sid })
      await request.server.app.cache.set(sid, { callerId, crn })

      return h.redirect(request.query?.next || '/farmer-apply/eligible-organisations')
    }
  }
}]
