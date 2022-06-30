const cheerio = require('cheerio')
const { v4: uuid } = require('uuid')
const { farmerApply, farmerClaim, vet } = require('../../../../../app/constants/user-types')
const { farmerApplyData: { organisation: organisationKey }, vetVisitData: { farmerApplication, signup } } = require('../../../../../app/session/keys')

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
    ])('route for $userType with valid email and token returns 200, redirects to \'org-review\', caches user data and sets cookies', async ({ userType, data }) => {
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

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(cacheGetSpy).toHaveBeenCalledTimes(1)
      expect(cacheGetSpy).toHaveBeenNthCalledWith(1, validToken)
      expect(res.headers.location).toEqual(redirectTo)
      expectVerifyLoginPage.hasCookiesSet(res)

      switch (userType) {
        case farmerApply:
          expect(session.setFarmerApplyData).toHaveBeenCalledTimes(1)
          expect(session.setFarmerApplyData).toHaveBeenCalledWith(res.request, organisationKey, org)
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
    })
  })
})
