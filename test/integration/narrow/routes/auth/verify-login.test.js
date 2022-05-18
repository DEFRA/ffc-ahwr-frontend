const cheerio = require('cheerio')
const { v4: uuid } = require('uuid')
const { farmerApply, farmerClaim, vet } = require('../../../../../app/config/user-types')
const { vetVisitData: { farmerApplication, signup } } = require('../../../../../app/session/keys')

const application = require('../../../../../app/messaging/application')
jest.mock('../../../../../app/messaging/application')
const session = require('../../../../../app/session')
jest.mock('../../../../../app/session')
const users = require('../../../../../app/api-requests/users')
jest.mock('../../../../../app/api-requests/users')

describe('Verify login page test', () => {
  beforeAll(async () => {
    jest.resetAllMocks()
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
      expectVerifyLoginPage.errorPageHasCorrectContent($)
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
      expectVerifyLoginPage.errorPageHasCorrectContent($)
    })

    test('route with empty query returns 400', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      expectVerifyLoginPage.errorPageHasCorrectContent($)
    })

    test.each([
      { userType: farmerApply, data: {} },
      { userType: farmerClaim, data: {} },
      { userType: vet, data: { reference: 'application-reference' } }
    ])('route for $userType with valid email and token returns 200, redirects to \'org-review\', caches user data, drops magiclink cache and sets cookies', async ({ userType, data }) => {
      const appRes = { createdAt: new Date('2022-04-01') }
      application.getApplication.mockResolvedValueOnce(appRes)
      const claim = { name: 'fake' }
      application.getClaim.mockResolvedValueOnce(claim)
      const org = { name: 'my-org' }
      users.getByEmail.mockResolvedValueOnce(org)
      const options = {
        method: 'GET',
        url: `${url}?email=${validEmail}&token=${validToken}`
      }

      await global.__SERVER__.app.magiclinkCache.set(validEmail, [validToken])
      await global.__SERVER__.app.magiclinkCache.set(validToken, { email: validEmail, redirectTo, userType, data })

      const cacheGetSpy = jest.spyOn(global.__SERVER__.app.magiclinkCache, 'get')
      const cacheDropSpy = jest.spyOn(global.__SERVER__.app.magiclinkCache, 'drop')

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(cacheGetSpy).toHaveBeenCalledTimes(2)
      expect(cacheGetSpy).toHaveBeenNthCalledWith(1, validToken)
      expect(cacheGetSpy).toHaveBeenNthCalledWith(2, validEmail)
      expect(cacheDropSpy).toHaveBeenCalledTimes(2)
      expect(cacheDropSpy).toHaveBeenNthCalledWith(1, validToken)
      expect(cacheDropSpy).toHaveBeenNthCalledWith(2, validEmail)
      expect(res.headers.location).toEqual(redirectTo)
      expectVerifyLoginPage.hasCookiesSet(res)
      expect(await global.__SERVER__.app.magiclinkCache.get(validEmail)).toBeNull()

      switch (userType) {
        case farmerApply:
          expect(session.setOrganisation).toHaveBeenCalledTimes(1)
          expect(session.setOrganisation).toHaveBeenCalledWith(res.request, Object.keys(org)[0], org.name)
          break
        case vet:
          expect(application.getApplication).toHaveBeenCalledTimes(1)
          expect(application.getApplication).toHaveBeenCalledWith(data.reference, res.request.yar.id)
          expect(session.setVetVisitData).toHaveBeenCalledTimes(2)
          expect(session.setVetVisitData).toHaveBeenNthCalledWith(1, res.request, signup, data)
          expect(session.setVetVisitData).toHaveBeenNthCalledWith(2, res.request, farmerApplication, appRes)
          break
      }

      cacheGetSpy.mockRestore()
      cacheDropSpy.mockRestore()
    })

    test.each([
      { userType: farmerApply, data: {} },
      { userType: farmerClaim, data: {} },
      { userType: vet, data: { reference: 'application-reference' } }
    ])('route for $userType with valid email and token returns 200 and removes all existing tokens for email, with no error when token has expired', async ({ userType, data }) => {
      application.getApplication.mockResolvedValueOnce({})
      application.getClaim.mockResolvedValueOnce({})
      users.getByEmail.mockResolvedValueOnce({})
      const options = {
        method: 'GET',
        url: `${url}?email=${validEmail}&token=${validToken}`
      }

      const oldTokens = [uuid(), uuid(), uuid()]
      await global.__SERVER__.app.magiclinkCache.set(validEmail, [validToken, ...oldTokens])
      await global.__SERVER__.app.magiclinkCache.set(validToken, { email: validEmail, redirectTo, userType, data })
      await global.__SERVER__.app.magiclinkCache.set(oldTokens[0], { email: validEmail, redirectTo, userType, data })
      await global.__SERVER__.app.magiclinkCache.set(oldTokens[1], { email: validEmail, redirectTo, userType, data })

      const cacheGetSpy = jest.spyOn(global.__SERVER__.app.magiclinkCache, 'get')
      const cacheDropSpy = jest.spyOn(global.__SERVER__.app.magiclinkCache, 'drop')

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(cacheGetSpy).toHaveBeenCalledTimes(2)
      expect(cacheGetSpy).toHaveBeenNthCalledWith(1, validToken)
      expect(cacheGetSpy).toHaveBeenNthCalledWith(2, validEmail)
      expect(cacheDropSpy).toHaveBeenCalledTimes(5)
      expect(cacheDropSpy).toHaveBeenNthCalledWith(1, validToken)
      expect(cacheDropSpy).toHaveBeenNthCalledWith(2, oldTokens[0])
      expect(cacheDropSpy).toHaveBeenNthCalledWith(3, oldTokens[1])
      expect(cacheDropSpy).toHaveBeenNthCalledWith(4, oldTokens[2])
      expect(cacheDropSpy).toHaveBeenLastCalledWith(validEmail)
      expect(res.headers.location).toEqual(redirectTo)
      expectVerifyLoginPage.hasCookiesSet(res)
      expect(await global.__SERVER__.app.magiclinkCache.get(validEmail)).toBeNull()

      cacheGetSpy.mockRestore()
      cacheDropSpy.mockRestore()
    })
  })
})
