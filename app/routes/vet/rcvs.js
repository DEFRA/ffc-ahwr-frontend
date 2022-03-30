const Joi = require('joi')

const errorMessages = {
  enterRCVS: 'Enter the RCVS number',
  formatRCVS: 'Enter a valid RCVS number'
}

module.exports = [{
  method: 'GET',
  path: '/vet/rcvs',
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('vet/rcvs')
    }
  }
}, {
  method: 'POST',
  path: '/vet/rcvs',
  options: {
    auth: false,
    validate: {
      payload: Joi.object({
        rcvs: Joi.string().pattern(/[0-9]{6}[0-9X]{1}/i).required()
          .messages({
            'any.required': errorMessages.enterRCVS,
            'string.base': errorMessages.enterRCVS,
            'string.empty': errorMessages.enterRCVS,
            'string.pattern.base': errorMessages.formatRCVS
          })
      }),
      failAction: async (request, h, error) => {
        console.log(error)
        console.log(request.payload)
        return h.view('vet/rcvs', { ...request.payload, errorMessage: { text: error.details[0].message } }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      // TODO: store in session
      return h.redirect('/vet/name')
    }
  }
}]
