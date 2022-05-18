const { cache, cookie: cookieConfig } = require('../../app/config')

function errorPageHasCorrectContent ($) {
  expect($('h1').text()).toEqual('Login failed')
}

function getCookiesMaxAge (cookieParts) {
  return cookieParts.find(cookiePart => cookiePart.split('=')[0].toLowerCase() === 'max-age')
}

function getCookieName (cookieParts) {
  return cookieParts[0].split('=')[0]
}

function hasCookiesSet (res) {
  let authCookieExists = false
  let sessionCookieExists = false

  res.headers['set-cookie'].forEach(cookie => {
    const cookieParts = cookie.split('; ')
    if (getCookieName(cookieParts) === cookieConfig.cookieNameAuth) {
      expect(getCookiesMaxAge(cookieParts).split('=')[1]).toEqual((cookieConfig.ttl / 1000).toString())
      authCookieExists = true
    } else if (getCookieName(cookieParts) === cookieConfig.cookieNameSession) {
      expect(getCookiesMaxAge(cookieParts).split('=')[1]).toEqual((cache.expiresIn / 1000).toString())
      sessionCookieExists = true
    }
  })
  expect(authCookieExists).toEqual(true)
  expect(sessionCookieExists).toEqual(true)
}

module.exports = {
  errorPageHasCorrectContent,
  hasCookiesSet
}
