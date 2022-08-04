const Joi = require('joi')
const { epg: epgValidation } = require('../../../app/lib/validation/percentage')

const path = 'claim/upload-invoice'
module.exports = [{
  method: 'GET',
  path: `/${path}`,
  options: {
    handler: async (_, h) => {
      return h.view(path)
    }
  }
}, {
  method: 'POST',
  path: `/${path}`,
  options: {
    validate: {
      payload: Joi.object({
        [speciesTest]: epgValidation
      }),
      failAction: async (request, h, error) => {
        return h.view(path, { ...request.payload, errorMessage: { text: error.details[0].message } }).code(400).takeover()
      }
    },
    handler: async (_, h) => {
      return h.redirect('/claim/submit-claim')
    }
  }
}]
