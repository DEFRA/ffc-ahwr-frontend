const Joi = require('joi')
const { v4: uuidv4 } = require('uuid')

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
        return h.redirect('/eligible-organisations')
      }
      return h.view('auth/login')
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
        crn: Joi.string().length(10).pattern(/^\d+$/).required(),
        password: Joi.string().required()
      }),
      failAction: async (request, h, error) => {
        return h.view('auth/login', { ...request.payload, errors: error }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { callerId, crn } = request.payload
      const sid = uuidv4()
      request.cookieAuth.set({ sid })
      await request.server.app.cache.set(sid, { callerId, crn })
      // TODO: Depends what eligibility checking is required as to what happens
      // here. Temporarily list dummy CPHs.
      return h.redirect('/eligible-organisations')
    }
  }
}]
