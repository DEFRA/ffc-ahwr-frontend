const { cookie: { cookieNameCookiePolicy } } = require('./config')

function getCurrentPolicy (request, h) {
  let cookiesPolicy = request.state[cookieNameCookiePolicy]
  if (!cookiesPolicy) {
    cookiesPolicy = createDefaultPolicy(h)
  }
  return cookiesPolicy
}

function createDefaultPolicy (h) {
  const cookiesPolicy = { confirmed: false, essential: true, analytics: false }
  h.state(cookieNameCookiePolicy, cookiesPolicy)
  return cookiesPolicy
}

function updatePolicy (request, h, analytics) {
  const cookiesPolicy = getCurrentPolicy(request, h)

  cookiesPolicy.analytics = analytics
  cookiesPolicy.confirmed = true

  h.state(cookieNameCookiePolicy, cookiesPolicy)

  if (!analytics) {
    h.unstate('_ga')
    h.unstate('_gid')
  }
}

module.exports = {
  getCurrentPolicy,
  updatePolicy
}
