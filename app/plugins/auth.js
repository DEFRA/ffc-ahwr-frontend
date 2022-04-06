const { getByEmail } = require('../api-requests/users')
const cookieConfig = require('../config').cookie
const { farmer, vet } = require('../config/user-types')
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
        redirectTo: (request) => {
          const { path } = request
          if (path.startsWith('/vet')) {
            return '/vet'
          }
          return '/farmer-apply/login'
        },
        validateFunc: async (request, session) => {
          const { path } = request
          const { userType } = session

          if (path.startsWith('/farmer-apply') && userType === farmer) {
            const result = { }
            if (isOrgInSession(request)) {
              result.valid = true
            } else {
              const org = await getByEmail(session.email)
              if (org) {
                Object.entries(org).forEach(([k, v]) => setOrganisation(request, k, v))
              }
              result.valid = !!org
            }
            return result
          } else if (path.startsWith('/vet') && userType === vet) {
            return { valid: true }
          }
          return { valid: false }
        }
      })
      server.auth.default({ strategy: 'session', mode: 'required' })
    }
  }
}
