const Joi = require('joi')
const boom = require('@hapi/boom')
const { speciesVaccinatedRadios } = require('../helpers/species-vaccinated-radios')
const { beef, dairy } = require('../../constants/species')
const speciesContent = require('../../constants/species-vaccinated-content-vet')
const session = require('../../session')
const { vetVisitData: { speciesVaccinated, farmerApplication } } = require('../../session/keys')

const { fully, partly, no, na } = require('../../constants/vaccinated-options')

function getBackLink (species) {
  return `/vet/${species}-eligibility`
}
module.exports = [
  {
    method: 'GET',
    path: '/vet/{species}-vaccinated',
    options: {
      validate: {
        params: Joi.object({
          species: Joi.string().valid(beef, dairy)
        })
      },
      handler: async (request, h) => {
        const species = request.params.species
        const application = session.getVetVisitData(request, farmerApplication)
        if (application.data.whichReview !== species) {
          throw boom.badRequest()
        }
        const title = speciesContent[species].title
        return h.view('vet/species-vaccinated', {
          ...speciesVaccinatedRadios(speciesContent[species].title, speciesVaccinated, session.getVetVisitData(request, speciesVaccinated)),
          backLink: getBackLink(species),
          title
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/vet/{species}-vaccinated',
    options: {
      validate: {
        payload: Joi.object({
          [speciesVaccinated]: Joi.string().valid(fully.value, partly.value, no.value, na.value).required()
        }),
        params: Joi.object({
          species: Joi.string().valid(beef, dairy)
        }),
        failAction: (request, h, _err) => {
          const species = request.params.species
          const title = speciesContent[species].title
          return h.view('vet/species-vaccinated', {
            ...speciesVaccinatedRadios(speciesContent[species].title, speciesVaccinated, session.getVetVisitData(request, speciesVaccinated), speciesContent[species].errorText),
            backLink: getBackLink(species),
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
        session.setVetVisitData(request, speciesVaccinated, request.payload[speciesVaccinated])
        return h.redirect('/vet/review-report')
      }
    }
  }
]
