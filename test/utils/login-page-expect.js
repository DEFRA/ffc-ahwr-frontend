function content ($) {
  expect($('.govuk-heading-l').text()).toEqual('Sign in to your Rural Payments account')
  expect($('label[for=crn]').text()).toEqual('Enter your RPA customer reference number (CRN)')
  expect($('label[for=password]').text()).toEqual('Enter your password')
}

function errors ($) {
  expect($('.govuk-error-summary').length).toEqual(1)
  expect($('.govuk-error-message').length).toEqual(2)
  expect($('.govuk-error-message').eq(0).text()).toMatch('"crn" is not allowed to be empty')
  expect($('.govuk-error-message').eq(1).text()).toMatch('"password" is not allowed to be empty')
}

module.exports = {
  content,
  errors
}
