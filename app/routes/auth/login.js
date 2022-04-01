const boom = require('@hapi/boom')
const Joi = require('joi')
const { getByEmail } = require('../../api-requests/users')
const { notify: { templateIdFarmerLogin } } = require('../../config')
const sendMagicLinkEmail = require('../../lib/email/send-magic-link-email')
const { email: emailValidation } = require('../../../app/lib/validation/email')

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
        return h.redirect(request.query?.next || 'farmer-apply/org-review')
      }
      return h.view('auth/magic-login')
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
        email: emailValidation
      }),
      failAction: async (request, h, error) => {
        return h.view('auth/magic-login', { ...request.payload, errorMessage: { text: error.details[0].message } }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { email } = request.payload
      const org = await getByEmail(email)

      if (!org) {
        return h.view('auth/magic-login', { ...request.payload, errorMessage: { text: `No user found with email address "${email}"` } }).code(400).takeover()
      }

      const result = await sendMagicLinkEmail(request, email, templateIdFarmerLogin)

      if (!result) {
        return boom.internal()
      }

      return h.view('auth/check-email', { email })
    }
  }
}]
