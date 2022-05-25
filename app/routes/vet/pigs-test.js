const Joi = require('joi')
const { vetVisitData: { pigsTest } } = require('../../session/keys')
const session = require('../../session')
const { getYesNoRadios } = require('../helpers/yes-no-radios')

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
        session.setVetVisitData(request, pigsTest, request.payload[pigsTest])
        return h.redirect('/vet/review-report')
      }
    }
  }
]
