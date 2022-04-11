const { inputErrorClass, labels } = require('../../config/visit-date')
const createItems = require('./date-input-items')
const { isDateInFutureOrBeforeStartDate } = require('./validation')

function getEmptyValuesMessage (emptyValues) {
  let text
  if (emptyValues.length === 3) {
    text = 'Enter the date of the visit'
  } else if (emptyValues.length === 2) {
    emptyValues.sort()
    text = `Visit date must include a ${emptyValues[0]} and a ${emptyValues[1]}`
  } else if (emptyValues.length === 1) {
    text = `Visit date must include a ${emptyValues[0]}`
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
    const day = payload[labels.day]
    const month = payload[labels.month]
    const year = payload[labels.year]
    const inputDate = new Date(year, month - 1, day)

    const { isDateValid, errorMessage } = isDateInFutureOrBeforeStartDate(inputDate)
    if (isDateValid) {
      text = 'Visit date must be a real date'
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
