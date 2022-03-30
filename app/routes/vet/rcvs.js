const Joi = require('joi')
const session = require('../../session')
const { rcvs: rcvsErrorMessages } = require('../../../app/lib/error-messages')

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
            'any.required': rcvsErrorMessages.enterRCVS,
            'string.base': rcvsErrorMessages.enterRCVS,
            'string.empty': rcvsErrorMessages.enterRCVS,
            'string.pattern.base': rcvsErrorMessages.formatRCVS
          })
      }),
      failAction: async (request, h, error) => {
        return h.view('vet/rcvs', { ...request.payload, errorMessage: { text: error.details[0].message } }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { rcvs } = request.payload
      session.setVetSignup(request, 'rcvs', rcvs)
      return h.redirect('/vet/name')
    }
  }
}]
