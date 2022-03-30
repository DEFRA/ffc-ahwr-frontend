const Joi = require('joi')
const session = require('../../session')
const { name: nameErrorMessages } = require('../../../app/lib/error-messages')

module.exports = [{
  method: 'GET',
  path: '/vet/name',
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('vet/name')
    }
  }
}, {
  method: 'POST',
  path: '/vet/name',
  options: {
    auth: false,
    validate: {
      payload: Joi.object({
        name: Joi.string().max(100).required()
          .messages({
            'any.required': nameErrorMessages.enterName,
            'string.base': nameErrorMessages.enterName,
            'string.empty': nameErrorMessages.enterName,
            'string.max': nameErrorMessages.nameLength
          })
      }),
      failAction: async (request, h, error) => {
        return h.view('vet/name', { ...request.payload, errorMessage: { text: error.details[0].message } }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { name } = request.payload
      session.setVetSignup(request, 'name', name)
      return h.redirect('/vet/practice')
    }
  }
}]
