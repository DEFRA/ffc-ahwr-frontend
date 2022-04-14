const { labels } = require('../../config/visit-date')
const { visitDate: errorMessages } = require('../../../app/lib/error-messages')

function getDateFromPayload (payload) {
  const day = payload[labels.day]
  const month = payload[labels.month]
  const year = payload[labels.year]
  return new Date(year, month - 1, day)
}

function isDateInFuture (date) {
  return date > new Date()
}

/**
 * Checks if `dateToCompare` is not more than 365 days older than `date`.
 *
 * @param {Date} date.
 * @param {Date} dateToCompare against.
 *
 * @return {boolean} result of comparison.
 */
function isDateWithinYear (date, dateToCompare) {
  const yearAgo = new Date(date)
  yearAgo.setFullYear(yearAgo.getFullYear() - 1)
  return dateToCompare < yearAgo
}

/**
 * Compares one date to another to check if it is before.
 *
 * @param {Date} date.
 * @param {Date} dateToCompare against.
 *
 * @return {boolean} result of comparison.
 */
function isDateBefore (date, dateToCompare) {
  const cloneDate = new Date(dateToCompare)
  cloneDate.setDate(cloneDate.getDate() - 1)
  return date < cloneDate
}

/**
 * Checks if the date in `payload` is in the future or before `dateToCompare`.
 *
 * @param {object} payload containing `day`, `month` & `year`.
 * @param {Date} dateToCompare the date to compare against.
 *
 * @return {object} containing boolean `isDateValid` property and an optional
 * `errorMessage` property object containing `text` - a string representing the
  * error message.
 */
function isDateInFutureOrBeforeFirstValidDate (payload, dateToCompare) {
  const date = getDateFromPayload(payload)

  const futureDate = isDateInFuture(date)
  if (futureDate || isDateBefore(date, dateToCompare) || isDateWithinYear(date, dateToCompare)) {
    return {
      errorMessage: {
        text: futureDate ? errorMessages.todayOrPast : errorMessages.startDateOrAfter(dateToCompare)
      },
      isDateValid: false
    }
  }
  return {
    isDateValid: true
  }
}

module.exports = {
  isDateInFutureOrBeforeFirstValidDate
}
