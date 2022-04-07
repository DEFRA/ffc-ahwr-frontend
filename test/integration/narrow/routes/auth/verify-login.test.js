const cheerio = require('cheerio')
const { v4: uuid } = require('uuid')

describe('Verify login page test', () => {
  let getByEmail

  beforeAll(async () => {
    jest.resetAllMocks()

    const orgs = require('../../../../../app/api-requests/users')
    getByEmail = orgs.getByEmail
    jest.mock('../../../../../app/api-requests/users')
  })

  const expectVerifyLoginPage = require('../../../../utils/verify-login-page-expect')
  const redirectTo = '/path-to-redirect-to/goes/here'
  const url = '/verify-login'
  const validEmail = 'dairy@ltd.com'
  const validToken = uuid()

  describe('GET /verify-login route', () => {
    test.each([
      { email: null },
      { email: '' },
      { email: 'not-an-email' },
      { email: 'email@not-on-list.com' }
    ])('route returns 400 when request does not include a valid email - $email', async ({ email }) => {
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
    ])('route returns 400 when request does not include a valid token - $token', async ({ token }) => {
      const options = {
        method: 'GET',
        url: `${url}?email=${validEmail}&token=${token}`
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      expectVerifyLoginPage.hasCorrectContent($)
    })

    test('route with empty query returns 400', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      expectVerifyLoginPage.hasCorrectContent($)
    })

    test('route with valid email and token returns 200, redirects to \'org-review\', caches user data, drops magiclink cache and sets cookies', async () => {
      const org = { name: 'my-org' }
      getByEmail.mockResolvedValue(org)
      const options = {
        method: 'GET',
        url: `${url}?email=${validEmail}&token=${validToken}`
      }

      await global.__SERVER__.app.magiclinkCache.set(validEmail, [validToken])
      await global.__SERVER__.app.magiclinkCache.set(validToken, { email: validEmail, redirectTo })

      const cacheGetSpy = jest.spyOn(global.__SERVER__.app.magiclinkCache, 'get')
      const cacheDropSpy = jest.spyOn(global.__SERVER__.app.magiclinkCache, 'drop')

      const res = await global.__SERVER__.inject(options)

      expect(cacheGetSpy).toHaveBeenCalledTimes(2)
      expect(cacheGetSpy).toHaveBeenNthCalledWith(1, validToken)
      expect(cacheGetSpy).toHaveBeenNthCalledWith(2, validEmail)
      expect(cacheDropSpy).toHaveBeenCalledTimes(2)
      expect(cacheDropSpy).toHaveBeenNthCalledWith(1, validToken)
      expect(cacheDropSpy).toHaveBeenNthCalledWith(2, validEmail)
      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(redirectTo)
      expectVerifyLoginPage.hasCookiesSet(res)
      expect(await global.__SERVER__.app.magiclinkCache.get(validEmail)).toBeNull()
      expect(res.request.yar.get('organisation')).toMatchObject(org)

      cacheGetSpy.mockRestore()
      cacheDropSpy.mockRestore()
    })

    test('route for valid email and token returns 200 and removes all existing tokens for email, with no error when token has expired', async () => {
      const org = { name: 'my-org' }
      getByEmail.mockResolvedValue(org)
      const options = {
        method: 'GET',
        url: `${url}?email=${validEmail}&token=${validToken}`
      }

      const oldTokens = [uuid(), uuid(), uuid()]
      await global.__SERVER__.app.magiclinkCache.set(validEmail, [validToken, ...oldTokens])
      await global.__SERVER__.app.magiclinkCache.set(validToken, { email: validEmail, redirectTo })
      await global.__SERVER__.app.magiclinkCache.set(oldTokens[0], { email: validEmail, redirectTo })
      await global.__SERVER__.app.magiclinkCache.set(oldTokens[1], { email: validEmail, redirectTo })

      const cacheGetSpy = jest.spyOn(global.__SERVER__.app.magiclinkCache, 'get')
      const cacheDropSpy = jest.spyOn(global.__SERVER__.app.magiclinkCache, 'drop')

      const res = await global.__SERVER__.inject(options)

      expect(cacheGetSpy).toHaveBeenCalledTimes(2)
      expect(cacheGetSpy).toHaveBeenNthCalledWith(1, validToken)
      expect(cacheGetSpy).toHaveBeenNthCalledWith(2, validEmail)
      expect(cacheDropSpy).toHaveBeenCalledTimes(5)
      expect(cacheDropSpy).toHaveBeenNthCalledWith(1, validToken)
      expect(cacheDropSpy).toHaveBeenNthCalledWith(2, oldTokens[0])
      expect(cacheDropSpy).toHaveBeenNthCalledWith(3, oldTokens[1])
      expect(cacheDropSpy).toHaveBeenNthCalledWith(4, oldTokens[2])
      expect(cacheDropSpy).toHaveBeenLastCalledWith(validEmail)
      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(redirectTo)
      expectVerifyLoginPage.hasCookiesSet(res)
      expect(await global.__SERVER__.app.magiclinkCache.get(validEmail)).toBeNull()
      expect(res.request.yar.get('organisation')).toMatchObject(org)

      cacheGetSpy.mockRestore()
      cacheDropSpy.mockRestore()
    })
  })
})
