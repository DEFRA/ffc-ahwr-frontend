const { startDateString } = require('../../config/visit-date')
const { visitDate: errorMessages } = require('../../../app/lib/error-messages')

function isDateInFuture (inputDate) {
  return inputDate > Date.now()
}

function isDateBeforeStartDate (inputDate) {
  const startDate = new Date(startDateString)
  return inputDate < startDate
}

function isDateInFutureOrBeforeStartDate (inputDate) {
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
