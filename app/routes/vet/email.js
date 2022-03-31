const boom = require('@hapi/boom')
const Joi = require('joi')
const { notify: { templateIdVetLogin } } = require('../../config')
const sendMagicLinkEmail = require('../../lib/email/send-magic-link-email')
const session = require('../../session')
const { vetSignup: { email: emailKey } } = require('../../session/keys')
const { email: emailErrorMessages } = require('../../../app/lib/error-messages')

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
        email: Joi.string().trim().email().required()
          .messages({
            'any.required': emailErrorMessages.enterEmail,
            'string.base': emailErrorMessages.enterEmail,
            'string.email': emailErrorMessages.validEmail,
            'string.empty': emailErrorMessages.enterEmail
          })
      }),
      failAction: async (request, h, error) => {
        return h.view('vet/email', { ...request.payload, errorMessage: { text: error.details[0].message } }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { email } = request.payload
      session.setVetSignup(request, emailKey, email)

      const result = await sendMagicLinkEmail(request, email, templateIdVetLogin)

      if (!result) {
        return boom.internal()
      }

      return h.redirect('/vet/check-email')
    }
  }
}]
