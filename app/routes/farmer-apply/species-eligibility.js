const Joi = require('joi')
const { farmerApplyData: { eligibleSpecies } } = require('../../session/keys')
const { getYesNoRadios } = require('../helpers/yes-no-radios')
const session = require('../../session')
const speciesTypes = require('../../constants/species')
const speciesContent = require('../../constants/species-content')
const backLink = '/farmer-apply/which-review'

const getRadioOptions = (species) => {
  return species === 'pigs' ? { isPageHeading: true, legendClasses: 'govuk-fieldset__legend--l', inline: true } : { isPageHeading: true, legendClasses: 'govuk-fieldset__legend--l', inline: true, hintText: speciesContent[species].hintText }
}

module.exports = [
  {
    method: 'GET',
    path: '/farmer-apply/{species}-eligibility',
    options: {
      validate: {
        params: Joi.object({
          species: Joi.string().valid(speciesTypes.beef, speciesTypes.dairy, speciesTypes.pigs, speciesTypes.sheep)
        })
      },
      handler: async (request, h) => {
        const species = request.params.species
        const title = speciesContent[species].title
        return h.view('farmer-apply/species-eligibility', {
          ...getYesNoRadios(speciesContent[species].legendText, eligibleSpecies, session.getFarmerApplyData(request, eligibleSpecies), undefined, getRadioOptions(species)),
          backLink,
          title
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/farmer-apply/{species}-eligibility',
    options: {
      validate: {
        payload: Joi.object({
          eligibleSpecies: Joi.string().valid('yes', 'no').required()
        }),
        params: Joi.object({
          species: Joi.string().valid(speciesTypes.beef, speciesTypes.dairy, speciesTypes.pigs, speciesTypes.sheep)
        }),
        failAction: (request, h, _err) => {
          const species = request.params.species
          const title = speciesContent[species].title
          return h.view('farmer-apply/species-eligibility', {
            ...getYesNoRadios(speciesContent[species].legendText, species, session.getFarmerApplyData(request, eligibleSpecies), speciesContent[species].errorText, getRadioOptions(species)),
            backLink,
            title
          }).code(400).takeover()
        }
      },
      handler: async (request, h) => {
        session.setFarmerApplyData(request, eligibleSpecies, request.payload.eligibleSpecies)
        const redirect = request.payload.eligibleSpecies === 'yes' ? 'check-answers' : 'not-eligible'
        return h.redirect(`/farmer-apply/${redirect}`)
      }
    }
  }
]
