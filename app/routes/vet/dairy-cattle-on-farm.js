const Joi = require('joi')
const { vetVisitData: { dairyCattleOnFarm } } = require('../../session/keys')
const getYesNoRadios = require('../helpers/yes-no-radios')
const session = require('../../session')

const legendText = 'Were there more than 10 dairy cattle on the farm at the time of the review?'
const errorText = 'Select yes if there were more than 10 cattle in the herd'
const backLink = '/vet/check-answers'

module.exports = [
  {
    method: 'GET',
    path: '/vet/dairy-cattle-on-farm',
    options: {
      handler: async (request, h) => {
        return h.view('vet/dairy-cattle-on-farm', {
          ...getYesNoRadios(legendText, dairyCattleOnFarm, session.getVetVisitData(request, dairyCattleOnFarm)),
          backLink
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/vet/dairy-cattle-on-farm',
    options: {
      validate: {
        payload: Joi.object({
          dairyCattleOnFarm: Joi.string().valid('yes', 'no').required()
        }),
        failAction: (request, h, _err) => {
          return h.view('vet/dairy-cattle-on-farm', {
            ...getYesNoRadios(legendText, dairyCattleOnFarm, session.getVetVisitData(request, dairyCattleOnFarm), errorText),
            backLink
          }).takeover()
        }
      },
      handler: async (request, h) => {
        session.setVetVisitData(request, dairyCattleOnFarm, request.payload[dairyCattleOnFarm])
        return h.redirect('/vet/declaration')
      }
    }
  }
]
