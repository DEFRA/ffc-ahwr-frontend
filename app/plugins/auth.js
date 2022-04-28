const { getByEmail } = require('../api-requests/users')
const cookieConfig = require('../config').cookie
const { farmerApply, farmerClaim, vet } = require('../config/user-types')
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
          } else if (path.startsWith('/farmer-claim')) {
            return '/farmer-claim/login'
          }
          return '/farmer-apply/login'
        },
        validateFunc: async (request, session) => {
          const { path } = request
          const { userType } = session

          const result = { valid: false }
          if (path.startsWith('/farmer-apply') && userType === farmerApply) {
            if (isOrgInSession(request)) {
              result.valid = true
            } else {
              const org = (await getByEmail(session.email)) ?? {}
              Object.entries(org).forEach(([k, v]) => setOrganisation(request, k, v))
              result.valid = !!org
            }
          } else if (path.startsWith('/farmer-claim') && userType === farmerClaim) {
            // TODO: Update this to check for the claim data
            if (isOrgInSession(request)) {
              result.valid = true
            } else {
              const org = (await getByEmail(session.email)) ?? {}
              Object.entries(org).forEach(([k, v]) => setOrganisation(request, k, v))
              result.valid = !!org
            }
          } else if (path.startsWith('/vet') && userType === vet) {
            result.valid = true
          }
          return result
        }
      })
      server.auth.default({ strategy: 'session', mode: 'required' })
    }
  }
}
