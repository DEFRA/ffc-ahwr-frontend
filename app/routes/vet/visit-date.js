const Joi = require('joi')
const session = require('../../session')
const { vetSignup: { reference: referenceKey } } = require('../../session/keys')

module.exports = [{
  method: 'GET',
  path: '/vet/visit-date',
  options: {
    handler: async (request, h) => {
      const reference = session.getVetSignup(request, referenceKey)
      return h.view('vet/visit-date', { reference })
    }
  }
}, {
  method: 'POST',
  path: '/vet/visit-date',
  options: {
    validate: {
      payload: Joi.object({
        'visit-date-day': Joi.number().min(1).max(31).required(),
        'visit-date-month': Joi.number().min(1).max(12).required(),
        'visit-date-year': Joi.number().min(2022).max(2022).required()
      }),
      // payload: async (val, options) => {
      //   console.log('payload for validation', val)
      //   const { 'visit-date-day': day, 'visit-date-month': month, 'visit-date-year': year } = val
      //   // const date = new Date(year, month, day)
      //   const date = `${month}-${day}-${year}`
      //   console.log('validating', date)
      //   const dateSchema = Joi.date().max('now').required()
      //   const res = dateSchema.validate(date)
      //   console.log('res', res)
      //   console.log('res', res.error.details)
      //   throw new Error(res.error.details)
      // },
      failAction: async (request, h, error) => {
        console.log('fail', error)
        return h.view('vet/visit-date', { ...request.payload, errorMessage: { text: error.details[0].message } }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      console.log('HANDLER', request.payload)
      // const { date } = request.payload
      // TODO: Send request to application to check it is valid
      // const application = getApplication(reference)

      // if (!application) {
      //   const errors = { details: [{ message: `No application found for reference "${reference}"` }] }
      //   return h.view('vet/reference', { ...request.payload, errors }).code(404).takeover()
      // }

      // session.setVetSignup(request, referenceKey, reference)

      return h.redirect('/vet/visit-date')
    }
  }
}]
