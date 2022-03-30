const Joi = require('joi')
const session = require('../../session')

const errorMessages = {
  enterName: 'Enter the name of the vet',
  nameLength: 'Name must be 100 characters or fewer'
}

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
            'any.required': errorMessages.enterName,
            'string.base': errorMessages.enterName,
            'string.empty': errorMessages.enterName,
            'string.max': errorMessages.nameLength
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
