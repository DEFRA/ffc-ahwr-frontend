const Joi = require('joi')
const boom = require('@hapi/boom')
const { vetVisitData: { pigsTest, farmerApplication } } = require('../../session/keys')
const session = require('../../session')
const { getYesNoRadios } = require('../helpers/yes-no-radios')
const species = require('../../constants/species')

const errorText = 'Select yes if PRRS was found in the herd'
const backLink = '/vet/check-answers'
const legendText = 'Did test results show that PRRS in the herd?'
function getRadios (previousAnswer, _errorText) {
  return getYesNoRadios(legendText, pigsTest, previousAnswer, _errorText)
}

const path = 'vet/pigs-test'
module.exports = [
  {
    method: 'GET',
    path: `/${path}`,
    options: {
      handler: async (request, h) => {
        const application = session.getVetVisitData(request, farmerApplication)
        if (application.data.whichReview !== species.pigs) throw boom.badRequest()
        return h.view(path, {
          ...getRadios(session.getVetVisitData(request, pigsTest)),
          backLink
        })
      }
    }
  },
  {
    method: 'POST',
    path: `/${path}`,
    options: {
      validate: {
        payload: Joi.object({
          [pigsTest]: Joi.string().valid('yes', 'no').required()
        }),
        failAction: (request, h, _err) => {
          return h.view(path, {
            ...getRadios(session.getVetVisitData(request, pigsTest), errorText),
            backLink
          }).code(400).takeover()
        }
      },
      handler: async (request, h) => {
        const application = session.getVetVisitData(request, farmerApplication)
        if (application.data.whichReview !== species.pigs) throw boom.badRequest()
        session.setVetVisitData(request, pigsTest, request.payload[pigsTest])
        return h.redirect('/vet/review-report')
      }
    }
  }
]
