const { labels, startDateString } = require('../../config/visit-date')
const { visitDate: errorMessages } = require('../../../app/lib/error-messages')

function isDateInFuture (inputDate) {
  return inputDate > Date.now()
}

function isDateBeforeStartDate (inputDate) {
  const startDate = new Date(startDateString)
  return inputDate < startDate
}

function isDateInFutureOrBeforeStartDate (payload) {
  const day = payload[labels.day]
  const month = payload[labels.month]
  const year = payload[labels.year]
  const inputDate = new Date(year, month - 1, day)

  const futureDate = isDateInFuture(inputDate)
  if (futureDate || isDateBeforeStartDate(inputDate)) {
    return {
      errorMessage: {
        text: futureDate ? errorMessages.todayOrPast : errorMessages.startDateOrAfter(),
        isDateValid: false
      }
    }
  }
  return {
    isDateValid: true
  }
}

module.exports = {
  isDateInFutureOrBeforeStartDate
}
