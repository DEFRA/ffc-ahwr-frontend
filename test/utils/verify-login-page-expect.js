const { cache, cookie } = require('../../app/config')

function hasCorrectContent ($) {
  expect($('h1').text()).toEqual('Login failed')
  const newLinkButton = $('.govuk-button')
  expect(newLinkButton.text()).toMatch('Request new link to login')
  expect(newLinkButton.attr('href')).toEqual('login')
}

function hasCookiesSet (res) {
  let authCookieExists = false
  let sessionCookieExists = false
  const cookies = res.headers['set-cookie']
  cookies.forEach(cookieVal => {
    const cookieParts = cookieVal.split('; ')
    if (cookieParts[0].split('=')[0] === cookie.cookieNameAuth) {
      const maxAge = cookieParts.find(cookiePart => cookiePart.split('=')[0].toLowerCase() === 'max-age')
      expect(maxAge).toBeUndefined()
      authCookieExists = true
    } else if (cookieParts[0].split('=')[0] === cookie.cookieNameSession) {
      const maxAge = cookieParts.find(cookiePart => cookiePart.split('=')[0].toLowerCase() === 'max-age').split('=')[1]
      expect(maxAge).toEqual((cache.expiresIn / 1000).toString())
      sessionCookieExists = true
    }
  })
  expect(authCookieExists).toEqual(true)
  expect(sessionCookieExists).toEqual(true)
}

module.exports = {
  hasCookiesSet,
  hasCorrectContent
}
