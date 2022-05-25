const Joi = require('joi')
const { vetVisitData: { eligibleSpecies } } = require('../../session/keys')
const { getYesNoRadios } = require('../helpers/yes-no-radios')
const session = require('../../session')
const speciesTypes = require('../../constants/species')
const speciesContent = require('../../constants/species-content-vet')
const backLink = '/vet/visit-date'

module.exports = [
  {
    method: 'GET',
    path: '/vet/{species}-eligibility',
    options: {
      validate: {
        params: Joi.object({
          species: Joi.string().valid(speciesTypes.beef, speciesTypes.dairy, speciesTypes.pigs, speciesTypes.sheep)
        })
      },
      handler: async (request, h) => {
        const species = request.params.species
        const title = speciesContent[species].title
        return h.view('vet/species-eligibility', {
          ...getYesNoRadios(speciesContent[species].legendText, eligibleSpecies, session.getVetVisitData(request, eligibleSpecies)),
          backLink,
          title
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/vet/{species}-eligibility',
    options: {
      validate: {
        payload: Joi.object({
          [eligibleSpecies]: Joi.string().valid('yes', 'no').required()
        }),
        params: Joi.object({
          species: Joi.string().valid(speciesTypes.beef, speciesTypes.dairy, speciesTypes.pigs, speciesTypes.sheep)
        }),
        failAction: (request, h, _err) => {
          const species = request.params.species
          const title = speciesContent[species].title
          return h.view('vet/species-eligibility', {
            ...getYesNoRadios(speciesContent[species].legendText, species, session.getVetVisitData(request, eligibleSpecies), speciesContent[species].errorText),
            backLink,
            title
          }).code(400).takeover()
        }
      },
      handler: async (request, h) => {
        session.setVetVisitData(request, eligibleSpecies, request.payload.eligibleSpecies)
        const species = request.params.species
        return h.redirect(`/vet/${species}-test`)
      }
    }
  }
]
