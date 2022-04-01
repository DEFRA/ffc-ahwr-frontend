const Joi = require('joi')
const session = require('../../session')
const { vetSignup: { reference: referenceKey } } = require('../../session/keys')
const { reference: referenceErrorMessages } = require('../../../app/lib/error-messages')

// TODO: implement proper application lookup
function getApplication (reference) {
  return true
}

module.exports = [{
  method: 'GET',
  path: '/vet/reference',
  options: {
    auth: false,
    handler: async (request, h) => {
      const reference = session.getVetSignup(request, referenceKey)
      return h.view('vet/reference', { reference })
    }
  }
}, {
  method: 'POST',
  path: '/vet/reference',
  options: {
    auth: false,
    validate: {
      payload: Joi.object({
        reference: Joi.string().trim().pattern(/^vv-[\da-f]{4}-[\da-f]{4}$/i).required()
          .messages({
            'any.required': referenceErrorMessages.enterRef,
            'string.base': referenceErrorMessages.enterRef,
            'string.empty': referenceErrorMessages.enterRef,
            'string.pattern.base': referenceErrorMessages.validRef
          })
      }),
      failAction: async (request, h, error) => {
        return h.view('vet/reference', { ...request.payload, errorMessage: { text: error.details[0].message } }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { reference } = request.payload
      // TODO: Send request to application to check it is valid
      const application = getApplication(reference)

      if (!application) {
        const errors = { details: [{ message: `No application found for reference "${reference}"` }] }
        return h.view('vet/reference', { ...request.payload, errors }).code(404).takeover()
      }

      session.setVetSignup(request, referenceKey, reference)

      return h.redirect('/vet/rcvs')
    }
  }
}]