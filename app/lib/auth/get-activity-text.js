const loginTypes = require('../../constants/login-types')

function getActivityText (loginType) {
  switch (loginType) {
    case loginTypes.apply:
      return 'The email includes a link to apply for a review. This link will expire in 15 minutes.'
    case loginTypes.claim:
      return 'The email includes a link to claim funding. This link will expire in 15 minutes.'
    case loginTypes.vet:
      return 'The email includes a link to record information about the review. This link will expire in 15 minutes.'
  }
}

module.exports = {
  getActivityText
}
