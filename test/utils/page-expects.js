function errors ($, expectedMessage) {
  expect($('.govuk-error-summary').length).toEqual(1)
  expect($('.govuk-error-message').length).toEqual(1)
  expect($('.govuk-error-message').eq(0).text()).toMatch(expectedMessage)
}

module.exports = {
  errors
}
