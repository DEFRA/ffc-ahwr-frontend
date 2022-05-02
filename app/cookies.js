const { cookie: { cookieNameCookiePolicy }, cookiePolicy } = require('./config')

function getCurrentPolicy (request, h) {
  let cookiesPolicy = request.state[cookieNameCookiePolicy]
  cookiesPolicy = Array.isArray(cookiesPolicy) ? cookiesPolicy[cookiesPolicy.length - 1] : cookiesPolicy
  if (!cookiesPolicy) {
    cookiesPolicy = createDefaultPolicy(h)
  }
  return cookiesPolicy
}

function createDefaultPolicy (h) {
  const cookiesPolicy = { confirmed: false, essential: true, analytics: false }
  h.state(cookieNameCookiePolicy, cookiesPolicy, cookiePolicy)
  return cookiesPolicy
}

function updatePolicy (request, h, analytics) {
  const cookiesPolicy = getCurrentPolicy(request, h)
  cookiesPolicy.analytics = analytics
  cookiesPolicy.confirmed = true

  h.state(cookieNameCookiePolicy, cookiesPolicy, cookiePolicy)
}

module.exports = {
  getCurrentPolicy,
  updatePolicy
}
