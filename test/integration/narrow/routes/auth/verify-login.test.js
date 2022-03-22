const cheerio = require('cheerio')
const { v4: uuid } = require('uuid')
const expectVerifyLoginPage = require('../../../../utils/verify-login-page-expect')
const { getByEmail } = require('../../../../../app/api-requests/orgs')

describe('Verify login page test', () => {
  const url = '/verify-login'
  const validEmail = 'dairy@ltd.com'
  const validToken = uuid()

  test.each([
    { email: null },
    { email: '' },
    { email: 'not-an-email' },
    { email: 'email@not-on-list.com' }
  ])('GET /verify-login route returns 400 when request does not include a valid email', async ({ email }) => {
    const options = {
      method: 'GET',
      url: `${url}?email=${email}&token=${validToken}`
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(400)
    const $ = cheerio.load(res.payload)
    expectVerifyLoginPage.hasCorrectContent($)
  })

  test.each([
    { token: null },
    { token: '' },
    { token: 'not-a-uuid' },
    { token: validToken }
  ])('GET /verify-login route returns 400 when request does not include a valid token', async ({ token }) => {
    const options = {
      method: 'GET',
      url: `${url}?email=${validEmail}&token=${token}`
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(400)
    const $ = cheerio.load(res.payload)
    expectVerifyLoginPage.hasCorrectContent($)
  })

  test('GET /verify-login route with empty query returns 400', async () => {
    const options = {
      method: 'GET',
      url
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(400)
    const $ = cheerio.load(res.payload)
    expectVerifyLoginPage.hasCorrectContent($)
  })

  test('GET /verify-login route with valid email and token returns 200, redirects to \'org-review\', caches user data, drops magiclink cache and sets cookies', async () => {
    const options = {
      method: 'GET',
      url: `${url}?email=${validEmail}&token=${validToken}`
    }

    await global.__SERVER__.app.magiclinkCache.set(validEmail, [validToken])

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toEqual('farmer-apply/org-review')
    expectVerifyLoginPage.hasCookiesSet(res)
    expect(await global.__SERVER__.app.magiclinkCache.get(validEmail)).toBeNull()
    expect(res.request.yar.get('organisation')).toMatchObject(getByEmail(validEmail))
  })
})
