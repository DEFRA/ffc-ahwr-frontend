const Joi = require('joi')
const session = require('../../session')
const { vetVisitData: { sheepTest } } = require('../../session/keys')
const { epg: epgValidation } = require('../../../app/lib/validation/percentage')

const path = 'vet/sheep-test'
module.exports = [{
  method: 'GET',
  path: `/${path}`,
  options: {
    handler: async (request, h) => {
      const epg = session.getVetSignup(request, sheepTest)
      return h.view(path, { epg })
    }
  }
}, {
  method: 'POST',
  path: `/${path}`,
  options: {
    validate: {
      payload: Joi.object({
        epg: epgValidation
      }),
      failAction: async (request, h, error) => {
        return h.view(path, { ...request.payload, errorMessage: { text: error.details[0].message } }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { epg } = request.payload

      session.setVetSignup(request, sheepTest, epg)

      return h.redirect('/vet/review-report')
    }
  }
}]
