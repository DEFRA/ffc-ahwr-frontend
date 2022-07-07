const Joi = require('joi')
const { getYesNoRadios } = require('../helpers/yes-no-radios')
const { getTypeOfReviewRowForDisplay } = require('../../lib/display-helpers')
const { getVetVisitData, setVetVisitData } = require('../../session')
const { vetVisitData: { detailsCorrect } } = require('../../session/keys')

const errorMessage = 'Select yes if these details are correct'
const legendText = 'Are these details correct?'

function getRows (claimData) {
  return [
    { key: { text: 'Business name' }, value: { text: claimData.organisation.name } },
    getTypeOfReviewRowForDisplay(claimData)
  ]
}

function getViewData (visitData, errorText) {
  return {
    ...getYesNoRadios(legendText, detailsCorrect, visitData[detailsCorrect], errorText, { isPageHeading: false, legendClasses: 'govuk-fieldset__legend--m', inline: true }),
    listData: { rows: getRows(visitData.farmerApplication.data) }
  }
}

const path = 'vet/check-review'
module.exports = [{
  method: 'GET',
  path: `/${path}`,
  options: {
    handler: async (request, h) => {
      const visitData = getVetVisitData(request)

      return h.view(path, getViewData(visitData))
    }
  }
},
{
  method: 'POST',
  path: `/${path}`,
  options: {
    validate: {
      payload: Joi.object({
        [detailsCorrect]: Joi.string().valid('yes', 'no').required()
      }),
      failAction: (request, h, _err) => {
        const visitData = getVetVisitData(request)
        return h.view(path, getViewData(visitData, errorMessage)).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const answer = request.payload[detailsCorrect]
      setVetVisitData(request, detailsCorrect, answer)
      if (answer === 'yes') {
        return h.redirect('/vet/visit-date')
      }
      return h.redirect('/vet/details-incorrect')
    }
  }
}]
