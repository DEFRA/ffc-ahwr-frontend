const Joi = require('joi')
const session = require('../../session')
const { practice: practiceErrorMessages } = require('../../../app/lib/error-messages')

module.exports = [{
  method: 'GET',
  path: '/vet/practice',
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('vet/practice')
    }
  }
}, {
  method: 'POST',
  path: '/vet/practice',
  options: {
    auth: false,
    validate: {
      payload: Joi.object({
        practice: Joi.string().max(100).required()
          .messages({
            'any.required': practiceErrorMessages.enterName,
            'string.base': practiceErrorMessages.enterName,
            'string.empty': practiceErrorMessages.enterName,
            'string.max': practiceErrorMessages.nameLength
          })
      }),
      failAction: async (request, h, error) => {
        return h.view('vet/practice', { ...request.payload, errorMessage: { text: error.details[0].message } }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { practice } = request.payload
      session.setVetSignup(request, 'practice', practice)
      return h.redirect('/vet/email')
    }
  }
}]
