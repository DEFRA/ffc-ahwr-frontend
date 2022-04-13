const Joi = require('joi')
const { labels } = require('../../config/visit-date')
const getDateInputErrors = require('../../lib/visit-date/date-input-errors')
const createItems = require('../../lib/visit-date/date-input-items')
const { isDateInFutureOrBeforeFirstValidDate } = require('../../lib/visit-date/validation')
const session = require('../../session')
const { vetVisitData: { farmerApplication } } = require('../../session/keys')

const templatePath = 'vet/visit-date'
const path = `/${templatePath}`

module.exports = [{
  method: 'GET',
  path,
  options: {
    handler: async (request, h) => {
      // TODO: pull the date from the session
      return h.view(templatePath)
    }
  }
}, {
  method: 'POST',
  path,
  options: {
    validate: {
      payload: Joi.object({
        [labels.day]: Joi.number().min(1)
          .when(labels.month, {
            switch: [
              { is: 2, then: Joi.number().max(28) },
              { is: Joi.number().valid(4, 6, 9, 11), then: Joi.number().max(30), otherwise: Joi.number().max(31) }
            ]
          })
          .required(),
        [labels.month]: Joi.number().min(1).max(12).required(),
        [labels.year]: Joi.number().min(2022).max(2022).required()
      }),
      failAction: async (request, h, error) => {
        const { createdAt } = session.getVetVisitData(request, farmerApplication)
        const dateInputErrors = getDateInputErrors(error.details, request.payload, createdAt)
        return h.view(templatePath, { ...request.payload, ...dateInputErrors }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { createdAt } = session.getVetVisitData(request, farmerApplication)

      const { isDateValid, errorMessage } = isDateInFutureOrBeforeFirstValidDate(request.payload, createdAt)
      if (!isDateValid) {
        const dateInputErrors = {
          errorMessage,
          items: createItems(request.payload, true)
        }
        return h.view(templatePath, { ...request.payload, ...dateInputErrors }).code(400).takeover()
      }
      return h.redirect('/vet/species')
    }
  }
}]
