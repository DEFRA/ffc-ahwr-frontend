const Joi = require('joi')

// TODO: implement proper application lookup
function getApplication (reference) {
  return true
}

module.exports = [{
  method: 'GET',
  path: '/vet/reference',
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('vet/reference')
    }
  }
}, {
  method: 'POST',
  path: '/vet/reference',
  options: {
    auth: false,
    validate: {
      payload: Joi.object({
        reference: Joi.string().pattern(/vv-[0-9a-f]{4}-[0-9a-f]{4}/i).messages({
          'string.base': 'Enter the reference number',
          'string.empty': 'Enter the reference number',
          'string.pattern.base': 'The reference number has the format begining "VV-" followed by two groups of four characters e.g. "VV-A2C4-EF78"'
        })
      }),
      failAction: async (request, h, error) => {
        console.log('error', error)
        return h.view('vet/reference', { ...request.payload, errors: error }).code(400).takeover()
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

      return h.redirect('/vet/practice')
    }
  }
}]
