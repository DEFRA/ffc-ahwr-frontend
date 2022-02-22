const { getOrgByReference } = require('../api-requests/orgs')
const cookieConfig = require('../config').cookie

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
          path: '/',
          ttl: 1000 * 3600 * 24 * 3
        },
        keepAlive: true,
        redirectTo: '/login',
        appendNext: true,
        validateFunc: async (_, session) => {
          // TODO: Ideally check reference hasn't been used already, for time
          // being just check there is an 'org' with matching reference
          const { reference } = session
          const org = getOrgByReference(reference)

          const valid = !!org
          const result = { valid }
          if (valid) {
            // TODO: replace with Defra Customer account
            result.credentials = { name: 'applicant-name' }
          } else {
            console.error(`Org was not found with reference: ${reference}`)
          }

          return result
        }
      })
      server.auth.default({ strategy: 'session', mode: 'required' })
    }
  }
}
