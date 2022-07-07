const Joi = require('joi')
const { sheepWormingTreamentRadios } = require('../helpers/sheep-worming-treatment-radios')
const { bz, lv, ml, ad, si } = require('../../constants/sheep-worming-treament-options')
const session = require('../../session')
const { vetVisitData: { sheepWormTreatment } } = require('../../session/keys')

const title = 'What was the active chemical in the worming treatment used?'
const errorText = 'Select the active chemical'
function getBackLink () {
  return '/vet/sheep-worms'
}

const path = 'vet/sheep-worming-treatment'
module.exports = [
  {
    method: 'GET',
    path: `/${path}`,
    options: {
      handler: async (request, h) => {
        return h.view('vet/sheep-worming-treatment', {
          ...sheepWormingTreamentRadios(title, sheepWormTreatment, session.getVetVisitData(request, sheepWormTreatment)),
          backLink: getBackLink(),
          title
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
          [sheepWormTreatment]: Joi.string().valid(bz.value, lv.value, ml.value, ad.value, si.value).required()
        }),
        failAction: (request, h, _err) => {
          return h.view('vet/sheep-worming-treatment', {
            ...sheepWormingTreamentRadios(title, sheepWormTreatment, session.getVetVisitData(request, sheepWormTreatment), errorText),
            backLink: getBackLink(),
            title
          }).code(400).takeover()
        }
      },
      handler: async (request, h) => {
        const answer = request.payload[sheepWormTreatment]
        session.setVetVisitData(request, sheepWormTreatment, answer)
        return h.redirect('/vet/sheep-test')
      }
    }
  }
]
