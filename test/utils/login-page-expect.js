function content ($) {
  expect($('.govuk-heading-l').text()).toEqual('Sign in with your reference number')
  expect($('label[for=reference]').text()).toEqual('Enter the reference number you received')
  expect($('label[for=sbi]').text()).toEqual('Enter your SBI number')
}

function errors ($) {
  expect($('.govuk-error-summary').length).toEqual(1)
  expect($('.govuk-error-message').length).toEqual(2)
  expect($('.govuk-error-message').eq(0).text()).toMatch('"reference" is not allowed to be empty')
  expect($('.govuk-error-message').eq(1).text()).toMatch('"sbi" is not allowed to be empty')
}

module.exports = {
  content,
  errors
}
