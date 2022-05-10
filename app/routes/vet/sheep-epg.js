const Joi = require('joi')
const session = require('../../session')
const { vetVisitData: { sheepEpg: sheepEpgKey } } = require('../../session/keys')
const { epg: epgValidation } = require('../../../app/lib/validation/percentage')

module.exports = [{
  method: 'GET',
  path: '/vet/sheep-epg',
  options: {
    auth: false,
    handler: async (request, h) => {
      const epg = session.getVetSignup(request, sheepEpgKey)
      return h.view('vet/sheep-epg', { epg })
    }
  }
}, {
  method: 'POST',
  path: '/vet/sheep-epg',
  options: {
    auth: false,
    validate: {
      payload: Joi.object({
        epg: epgValidation
      }),
      failAction: async (request, h, error) => {
        return h.view('vet/sheep-epg', { ...request.payload, errorMessage: { text: error.details[0].message } }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { epg } = request.payload
      session.setVetSignup(request, sheepEpgKey, epg)

      return h.redirect('/vet/check-answers')
    }
  }
}]
