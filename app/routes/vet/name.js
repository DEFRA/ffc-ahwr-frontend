const Joi = require('joi')
const session = require('../../session')
const { vetSignup: { name: nameKey } } = require('../../session/keys')
const { name: nameErrorMessages } = require('../../../app/lib/error-messages')

module.exports = [{
  method: 'GET',
  path: '/vet/name',
  options: {
    auth: false,
    handler: async (request, h) => {
      const name = session.getVetSignup(request, nameKey)
      return h.view('vet/name', { name })
    }
  }
}, {
  method: 'POST',
  path: '/vet/name',
  options: {
    auth: false,
    validate: {
      payload: Joi.object({
        name: Joi.string().trim().max(100).required()
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
      session.setVetSignup(request, nameKey, name)
      return h.redirect('/vet/practice')
    }
  }
}]
