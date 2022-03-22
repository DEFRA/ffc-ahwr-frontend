const { getByEmail } = require('../api-requests/orgs')
const cookieConfig = require('../config').cookie
const { getOrganisation, setOrganisation } = require('../session')

function isOrgInSession (request) {
  return !!getOrganisation(request)
}

module.exports = {
  plugin: {
    name: 'auth',
    register: async (server, _) => {
      server.auth.strategy('session', 'cookie', {
        cookie: {
          isSameSite: cookieConfig.isSameSite,
          isSecure: cookieConfig.isSecure,
          name: cookieConfig.cookieNameAuth,
          password: cookieConfig.password,
          path: '/'
        },
        keepAlive: true,
        redirectTo: '/login',
        appendNext: true,
        validateFunc: async (request, session) => {
          const result = { }
          if (isOrgInSession(request)) {
            result.valid = true
          } else {
            const org = getByEmail(session.email)
            Object.entries(org).forEach(([k, v]) => setOrganisation(request, k, v))
            result.valid = !!org
          }

          return result
        }
      })
      server.auth.default({ strategy: 'session', mode: 'required' })
    }
  }
}
