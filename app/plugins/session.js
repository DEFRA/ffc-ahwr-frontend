const { cookie } = require('../config')

module.exports = {
  plugin: require('@hapi/yar'),
  options: {
    name: cookie.cookieNameSession,
    maxCookieSize: 0,
    cookieOptions: {
      isHttpOnly: true,
      isSameSite: cookie.isSameSite,
      isSecure: cookie.isSecure,
      password: cookie.password,
      ttl: 1000 * 3600 * 24 * 3
    }
  }
}
