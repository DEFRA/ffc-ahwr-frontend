const Joi = require('joi')
const boom = require('@hapi/boom')
const { speciesVaccinationUpToDateRadios } = require('../helpers/species-vaccination-up-to-date-radios')
const { beef, dairy } = require('../../constants/species')
const { yes, no, na } = require('../../constants/vaccination-up-to-date-options')
const session = require('../../session')
const { vetVisitData: { speciesVaccinationUpToDate, farmerApplication } } = require('../../session/keys')

const title = 'Are all breeding cattle currently up to date with vaccination?'
const errorText = 'Select yes if breeding cattle are vaccinated'
function getBackLink (species) {
  return `/vet/${species}-last-vaccinated`
}
module.exports = [
  {
    method: 'GET',
    path: '/vet/{species}-vaccination-up-to-date',
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
        return h.view('vet/species-vaccination-up-to-date', {
          ...speciesVaccinationUpToDateRadios(title, speciesVaccinationUpToDate, session.getVetVisitData(request, speciesVaccinationUpToDate)),
          backLink: getBackLink(species),
          title
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/vet/{species}-vaccination-up-to-date',
    options: {
      validate: {
        payload: Joi.object({
          [speciesVaccinationUpToDate]: Joi.string().valid(yes.value, no.value, na.value).required()
        }),
        params: Joi.object({
          species: Joi.string().valid(beef, dairy)
        }),
        failAction: (request, h, _err) => {
          const species = request.params.species
          return h.view('vet/species-vaccination-up-to-date', {
            ...speciesVaccinationUpToDateRadios(title, speciesVaccinationUpToDate, session.getVetVisitData(request, speciesVaccinationUpToDate), errorText),
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
        const answer = request.payload[speciesVaccinationUpToDate]
        session.setVetVisitData(request, speciesVaccinationUpToDate, answer)
        return h.redirect(`/vet/${species}-test`)
      }
    }
  }
]
