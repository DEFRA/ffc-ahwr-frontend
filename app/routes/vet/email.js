const Joi = require('joi')
const session = require('../../session')
const { email: emailErrorMessages } = require('../../../app/lib/error-messages')

module.exports = [{
  method: 'GET',
  path: '/vet/email',
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('vet/email')
    }
  }
}, {
  method: 'POST',
  path: '/vet/email',
  options: {
    auth: false,
    validate: {
      payload: Joi.object({
        email: Joi.string().email().required()
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
      session.setVetSignup(request, 'email', email)
      return h.redirect('/vet/check-email')
    }
  }
}]
