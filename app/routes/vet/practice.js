const Joi = require('joi')
const session = require('../../session')

const errorMessages = {
  enterName: 'Enter the name of the practice',
  nameLength: 'Practice name must be 100 characters or fewer'
}

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
            'any.required': errorMessages.enterName,
            'string.base': errorMessages.enterName,
            'string.empty': errorMessages.enterName,
            'string.max': errorMessages.nameLength
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
