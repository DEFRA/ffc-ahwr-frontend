const { startDateString } = require('../../config/visit-date')

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
    const startDate = new Date(startDateString)
    return {
      errorMessage: {
        text: futureDate ? 'Visit date must be today or in the past' : `Visit date must be the same as or after ${startDate.toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
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
