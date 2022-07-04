const Joi = require('joi')
const boom = require('@hapi/boom')
const { getYesNoRadios } = require('../helpers/yes-no-radios')
const speciesTypes = require('../../constants/species')
const session = require('../../session')
const { vetVisitData: { farmerApplication, speciesBvdInHerd } } = require('../../session/keys')

const title = 'Is there evidence of circulating BVD virus within the herd?'
const errorText = 'Select yes if test results showed evidence BVD is circulating within the herd'
function getBackLink (request) {
  const species = request.params.species
  return `/vet/${species}-test`
}
module.exports = [
  {
    method: 'GET',
    path: '/vet/{species}-bvd-in-herd',
    options: {
      validate: {
        params: Joi.object({
          species: Joi.string().valid(speciesTypes.beef, speciesTypes.dairy)
        })
      },
      handler: async (request, h) => {
        const species = request.params.species
        const application = session.getVetVisitData(request, farmerApplication)
        if (application.data.whichReview !== species) {
          throw boom.badRequest()
        }
        return h.view('vet/species-bvd-in-herd', {
          ...getYesNoRadios(title, speciesBvdInHerd, session.getVetVisitData(request, speciesBvdInHerd), null, { inline: true }),
          backLink: getBackLink(request),
          title
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/vet/{species}-bvd-in-herd',
    options: {
      validate: {
        payload: Joi.object({
          [speciesBvdInHerd]: Joi.string().valid('yes', 'no').required()
        }),
        params: Joi.object({
          species: Joi.string().valid(speciesTypes.beef, speciesTypes.dairy)
        }),
        failAction: (request, h, _err) => {
          return h.view('vet/species-bvd-in-herd', {
            ...getYesNoRadios(title, speciesBvdInHerd, session.getVetVisitData(request, speciesBvdInHerd), errorText, { inline: true }),
            backLink: getBackLink(request),
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
        session.setVetVisitData(request, speciesBvdInHerd, request.payload[speciesBvdInHerd])
        return h.redirect('/vet/review-report')
      }
    }
  }
]
