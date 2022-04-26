const boom = require('@hapi/boom')
const Joi = require('joi')
const { getByEmail } = require('../../api-requests/users')
const { sendFarmerClaimLoginMagicLink } = require('../../lib/email/send-magic-link-email')
const { email: emailValidation } = require('../../../app/lib/validation/email')

// TODO: refactor this to share with farmer-apply/login
module.exports = [{
  method: 'GET',
  path: '/farmer-claim/login',
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
        return h.redirect(request.query?.next || '/farmer-claim/visit-review')
      }
      return h.view('auth/magic-login')
    }
  }
}, {
  method: 'POST',
  path: '/farmer-claim/login',
  options: {
    auth: {
      mode: 'try'
    },
    validate: {
      payload: Joi.object({
        email: emailValidation
      }),
      failAction: async (request, h, error) => {
        return h.view('auth/magic-login', { ...request.payload, errorMessage: { text: error.details[0].message } }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { email } = request.payload
      const users = await getByEmail(email)

      if (!users) {
        return h.view('auth/magic-login', { ...request.payload, errorMessage: { text: `No user found with email address "${email}"` } }).code(400).takeover()
      }

      const result = await sendFarmerClaimLoginMagicLink(request, email)

      if (!result) {
        return boom.internal()
      }

      return h.view('auth/check-email', { email })
    }
  }
}]
