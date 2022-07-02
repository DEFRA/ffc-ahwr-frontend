const Joi = require('joi')
const boom = require('@hapi/boom')
const { getYesNoRadios } = require('../helpers/yes-no-radios')
const speciesTypes = require('../../constants/species')
const speciesContent = require('../../constants/species-test-content-vet')
const session = require('../../session')
const { vetVisitData: { speciesTest, farmerApplication } } = require('../../session/keys')

const backLink = '/vet/visit-date'
module.exports = [
  {
    method: 'GET',
    path: '/vet/{species}-test',
    options: {
      validate: {
        params: Joi.object({
          species: Joi.string().valid(speciesTypes.beef, speciesTypes.dairy, speciesTypes.pigs)
        })
      },
      handler: async (request, h) => {
        const species = request.params.species
        const application = session.getVetVisitData(request, farmerApplication)
        if (application.data.whichReview !== species) {
          throw boom.badRequest()
        }
        const title = speciesContent[species].title
        return h.view('vet/species-test', {
          ...getYesNoRadios(speciesContent[species].legendText, speciesTest, session.getVetVisitData(request, speciesTest)),
          backLink,
          title
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/vet/{species}-test',
    options: {
      validate: {
        payload: Joi.object({
          [speciesTest]: Joi.string().valid('yes', 'no').required()
        }),
        params: Joi.object({
          species: Joi.string().valid(speciesTypes.beef, speciesTypes.dairy, speciesTypes.pigs)
        }),
        failAction: (request, h, _err) => {
          const species = request.params.species
          const title = speciesContent[species].title
          return h.view('vet/species-test', {
            ...getYesNoRadios(speciesContent[species].legendText, species, session.getVetVisitData(request, speciesTest), speciesContent[species].errorText),
            backLink,
            title
          }).code(400).takeover()
        }
      },
      handler: async (request, h) => {
        const species = request.params.species
        const application = session.getVetVisitData(request, farmerApplication)
        if (application.data.whichReview !== species) {
          throw boom.badRequest()
        }
        session.setVetVisitData(request, speciesTest, request.payload.speciesTest)
        return h.redirect('/vet/review-report')
      }
    }
  }
]
