const Joi = require('joi')
const boom = require('@hapi/boom')
const { getYesNoRadios } = require('../helpers/yes-no-radios')
const session = require('../../session')
const { vetVisitData: { sheepWorms, sheepWormTreatment, speciesTest, farmerApplication } } = require('../../session/keys')
const species = require('../../constants/species')

const errorText = 'Select yes if the first check showed worms'
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
      session.setVetVisitData(request, speciesTest, null)
      session.setVetVisitData(request, sheepWormTreatment, null)
      const prevAnswer = session.getVetVisitData(request, sheepWorms)
      return h.view(path, { ...getYesNoRadios(labelText, sheepWorms, prevAnswer, null, { inline: true }) })
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
        return h.redirect('/vet/sheep-worming-treatment')
      } else {
        return h.redirect('/vet/review-report')
      }
    }
  }
}]
