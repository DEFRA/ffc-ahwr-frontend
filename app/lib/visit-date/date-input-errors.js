const createItems = require('./date-input-items')
const { isDateInFutureOrBeforeStartDate } = require('./validation')
const { inputErrorClass } = require('../../config/visit-date')
const { visitDate: errorMessages } = require('../../../app/lib/error-messages')

function getEmptyValuesMessage (emptyValues) {
  let text
  if (emptyValues.length === 3) {
    text = errorMessages.enterDate
  } else if (emptyValues.length === 2) {
    emptyValues.sort()
    text = errorMessages.emptyValues(emptyValues[0], emptyValues[1])
  } else if (emptyValues.length === 1) {
    text = errorMessages.emptyValues(emptyValues[0])
  }
  return text
}

module.exports = (errorDetails, payload) => {
  const items = createItems(payload, false)

  const emptyValues = []
  errorDetails.forEach(err => {
    const item = items.find(x => x.name === err.context.label.split('-').pop())
    item.classes += ` ${inputErrorClass}`
    if (item.value === '') {
      emptyValues.push(item.name)
    }
  })

  let text = getEmptyValuesMessage(emptyValues)
  if (!text) {
    const { isDateValid, errorMessage } = isDateInFutureOrBeforeStartDate(payload)
    if (isDateValid) {
      text = errorMessages.realDate
    } else {
      text = errorMessage.text
      items.forEach(item => {
        item.classes += ` ${inputErrorClass}`
      })
    }
  }

  return {
    errorMessage: { text },
    items
  }
}
