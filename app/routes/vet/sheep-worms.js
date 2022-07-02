const Joi = require('joi')
const boom = require('@hapi/boom')
const { getYesNoRadios } = require('../helpers/yes-no-radios')
const session = require('../../session')
const { vetVisitData: { sheepWorms, farmerApplication } } = require('../../session/keys')
const species = require('../../constants/species')

const errorText = 'Select yes if there were worms in the first check'
const labelText = 'Were there worms in the first check?'

const path = 'vet/sheep-worms'
module.exports = [{
  method: 'GET',
  path: `/${path}`,
  options: {
    handler: async (request, h) => {
      const application = session.getVetVisitData(request, farmerApplication)
      if (application.data.whichReview !== species.sheep) {
        throw boom.badRequest()
      }
      const prevAnswer = session.getVetVisitData(request, sheepWorms)
      return h.view(path, { ...getYesNoRadios(labelText, sheepWorms, prevAnswer) })
    }
  }
}, {
  method: 'POST',
  path: `/${path}`,
  options: {
    validate: {
      payload: Joi.object({
        [sheepWorms]: Joi.string().valid('yes', 'no').required()
      }),
      failAction: async (request, h, _error) => {
        const prevAnswer = session.getVetVisitData(request, sheepWorms)
        return h.view(path, { ...getYesNoRadios(labelText, sheepWorms, prevAnswer, errorText) }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const application = session.getVetVisitData(request, farmerApplication)
      if (application.data.whichReview !== species.sheep) {
        throw boom.badRequest()
      }
      session.setVetVisitData(request, sheepWorms, request.payload[sheepWorms])
      const answer = request.payload[sheepWorms]
      if (answer === 'yes') {
        return h.redirect('/vet/sheep-test')
      } else {
        return h.redirect('/vet/review-report')
      }
    }
  }
}]
