const loginTypes = require('../../app/constants/login-types')

function hasCorrectContent ($, pageType) {
  let hintText
  switch (pageType) {
    case loginTypes.apply:
      hintText = "We'll use this to send you a link to apply for a review."
      break
    case loginTypes.claim:
      hintText =
        "We'll use this to send you a link to claim funding for a review."
      break
  }
  expect($('h1').text()).toMatch('Enter your email address')
  expect($('label[for=email]').text()).toMatch('Enter your email address')
  expect($('#email-hint').text()).toMatch(hintText)
}

module.exports = {
  hasCorrectContent
}
