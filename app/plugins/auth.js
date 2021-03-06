const { getByEmail } = require('../api-requests/users')
const { cookie: cookieConfig, cookiePolicy } = require('../config')
const { farmerApply, farmerClaim, vet } = require('../constants/user-types')
const { getClaim, getFarmerApplyData, setClaim, setFarmerApplyData } = require('../session')
const { farmerApplyData: { organisation: organisationKey } } = require('../session/keys')

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
          path: cookiePolicy.path,
          ttl: cookieConfig.ttl
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
            if (getFarmerApplyData(request, organisationKey)) {
              result.valid = true
            } else {
              const organisation = (await getByEmail(session.email)) ?? {}
              setFarmerApplyData(request, organisationKey, organisation)
              result.valid = !!organisation
            }
          } else if (path.startsWith('/farmer-claim') && userType === farmerClaim) {
            if (getClaim(request, organisationKey)) {
              result.valid = true
            } else {
              const organisation = (await getByEmail(session.email)) ?? {}
              setClaim(request, organisationKey, organisation)
              result.valid = !!organisation
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
