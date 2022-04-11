const { inputErrorClass, labelPrefix } = require('../../config/visit-date')

module.exports = (payload, includeErrorClass) => {
  const items = [{
    name: 'day',
    classes: 'govuk-input--width-2'
  }, {
    name: 'month',
    classes: 'govuk-input--width-2'
  }, {
    name: 'year',
    classes: 'govuk-input--width-4'
  }]

  items.forEach(item => {
    item.value = payload?.[`${labelPrefix}${item.name}`]
    item.classes += includeErrorClass ? ` ${inputErrorClass}` : ''
  })
  return items
}
