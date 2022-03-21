function hasCorrectContent ($) {
  expect($('.govuk-heading-l').text()).toEqual('Sign in with your email address')
  expect($('label[for=email]').text()).toEqual('Enter your email address')
}

function errors ($, expectedMessage) {
  expect($('.govuk-error-summary').length).toEqual(1)
  expect($('.govuk-error-message').length).toEqual(1)
  expect($('.govuk-error-message').eq(0).text()).toMatch(expectedMessage)
}

module.exports = {
  errors,
  hasCorrectContent
}
