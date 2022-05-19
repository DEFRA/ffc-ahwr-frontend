const boom = require('@hapi/boom')
const Joi = require('joi')
const loginTypes = require('../../constants/login-types')
const { getActivityText } = require('../../lib/auth/get-activity-text')
const { sendVetMagicLinkEmail } = require('../../lib/email/send-magic-link-email')
const { email: emailValidation } = require('../../lib/validation/email')
const session = require('../../session')
const { vetSignup: { email: emailKey } } = require('../../session/keys')

module.exports = [{
  method: 'GET',
  path: '/vet/email',
  options: {
    auth: false,
    handler: async (request, h) => {
      const email = session.getVetSignup(request, emailKey)
      return h.view('vet/email', { email })
    }
  }
}, {
  method: 'POST',
  path: '/vet/email',
  options: {
    auth: false,
    validate: {
      payload: Joi.object({
        email: emailValidation
      }),
      failAction: async (request, h, error) => {
        return h.view('vet/email', { ...request.payload, errorMessage: { text: error.details[0].message } }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { email } = request.payload
      session.setVetSignup(request, emailKey, email)

      const data = session.getVetSignup(request)
      const result = await sendVetMagicLinkEmail(request, email, data)

      if (!result) {
        return boom.internal()
      }

      return h.view('auth/check-email', { activityText: getActivityText(loginTypes.vet), email })
    }
  }
}]
