function hasCorrectContent ($) {
  expect($('.govuk-main-wrapper .govuk-heading-l').text()).toEqual('Sign in with your email address')
  expect($('label[for=email]').text()).toMatch('Enter your email address')
}

module.exports = {
  hasCorrectContent
}
