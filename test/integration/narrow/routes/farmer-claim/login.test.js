const cheerio = require('cheerio')
const { v4: uuid } = require('uuid')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectLoginPage = require('../../../../utils/login-page-expect')
const pageExpects = require('../../../../utils/page-expects')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const { notify: { templateIdFarmerClaimLogin }, serviceUri } = require('../../../../../app/config')
const { farmerClaim } = require('../../../../../app/constants/user-types')
const uuidRegex = require('../../../../../app/config/uuid-regex')
const loginTypes = require('../../../../../app/constants/login-types')

describe('Farmer claim login page test', () => {
  const org = { name: 'my-org' }
  const claimWithVisit = { vetVisit: {} }
  const url = '/farmer-claim/login'
  const validEmail = 'dairy@ltd.com'

  const application = require('../../../../../app/messaging/application')
  jest.mock('../../../../../app/messaging/application')
  const session = require('../../../../../app/session')
  jest.mock('../../../../../app/session')
  const sendEmail = require('../../../../../app/lib/email/send-email')
  jest.mock('../../../../../app/lib/email/send-email')
  const orgs = require('../../../../../app/api-requests/users')
  jest.mock('../../../../../app/api-requests/users')

  beforeEach(() => {
    jest.resetAllMocks()
    application.getClaim.mockResolvedValue(claimWithVisit)
    orgs.getByEmail.mockResolvedValue(org)
    sendEmail.mockResolvedValue(true)
  })

  describe(`GET requests to '${url}'`, () => {
    test('returns 200', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expectPhaseBanner.ok($)
      expectLoginPage.hasCorrectContent($, loginTypes.claim)
    })

    test('route when already logged in redirects to visit-review', async () => {
      const options = {
        auth: { credentials: { email: validEmail }, strategy: 'cookie', isAuthenticated: true },
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/farmer-claim/visit-review')
    })
  })

  describe(`POST requests to '${url}' route`, () => {
    test.each([
      { email: 'not-an-email', errorMessage: 'Enter a valid email address' },
      { email: '', errorMessage: 'Enter an email address' },
      { email: null, errorMessage: 'Enter an email address' },
      { email: undefined, errorMessage: 'Enter an email address' },
      { email: 'missing@email.com', errorMessage: 'No user found with email address "missing@email.com"' }
    ])('returns 400 when request contains incorrect email - %p', async ({ email, errorMessage }) => {
      orgs.getByEmail.mockResolvedValue(null)
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, email },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      expectPhaseBanner.ok($)
      expectLoginPage.hasCorrectContent($, loginTypes.claim)
      pageExpects.errors($, errorMessage)
    })

    test.each([
      { crumb: '' },
      { crumb: undefined }
    ])('returns 403 when request does not contain crumb - $crumb', async ({ crumb }) => {
      const options = {
        method: 'POST',
        url,
        payload: { crumb },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(403)
      const $ = cheerio.load(res.payload)
      expectPhaseBanner.ok($)
      expect($('.govuk-heading-l').text()).toEqual('403 - Forbidden')
    })

    test('with known email for the first time redirects to email sent page with form filled with email and adds token to cache with redirectTo for farmer', async () => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, email: validEmail },
        headers: { cookie: `crumb=${crumb}` }
      }

      const cacheGetSpy = jest.spyOn(global.__SERVER__.app.magiclinkCache, 'get')
      const cacheSetSpy = jest.spyOn(global.__SERVER__.app.magiclinkCache, 'set')

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      expect(cacheGetSpy).toHaveBeenCalledTimes(1)
      expect(cacheGetSpy).toHaveBeenCalledWith(validEmail)
      expect(cacheSetSpy).toHaveBeenCalledTimes(2)
      expect(cacheSetSpy).toHaveBeenNthCalledWith(1, validEmail, [expect.stringMatching(new RegExp(uuidRegex))])
      expect(cacheSetSpy).toHaveBeenNthCalledWith(2, expect.stringMatching(new RegExp(uuidRegex)), { email: validEmail, redirectTo: 'farmer-claim/visit-review', userType: farmerClaim })
      expect(application.getClaim).toHaveBeenCalledTimes(1)
      expect(application.getClaim).toHaveBeenCalledWith(validEmail, res.request.yar.id)
      expect(session.setClaim).toHaveBeenCalledTimes(1)
      expect(session.setClaim).toHaveBeenCalledWith(res.request, 'vetVisit', claimWithVisit.vetVisit)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toEqual('Email has been sent')
      expect($('form input[name=email]').val()).toEqual(validEmail)

      cacheGetSpy.mockRestore()
      cacheSetSpy.mockRestore()
    })

    test('with known email with an existing token redirects to email sent page and adds token to cache with redirectTo for farmer', async () => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, email: validEmail },
        headers: { cookie: `crumb=${crumb}` }
      }
      const token = uuid()
      await global.__SERVER__.app.magiclinkCache.set(validEmail, [token])

      const cacheGetSpy = jest.spyOn(global.__SERVER__.app.magiclinkCache, 'get')
      const cacheSetSpy = jest.spyOn(global.__SERVER__.app.magiclinkCache, 'set')

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      expect(cacheGetSpy).toHaveBeenCalledTimes(1)
      expect(cacheGetSpy).toHaveBeenCalledWith(validEmail)
      expect(cacheSetSpy).toHaveBeenCalledTimes(2)
      expect(cacheSetSpy).toHaveBeenNthCalledWith(1, validEmail, [token, expect.stringMatching(new RegExp(uuidRegex))])
      expect(cacheSetSpy).toHaveBeenNthCalledWith(2, expect.stringMatching(new RegExp(uuidRegex)), { email: validEmail, redirectTo: 'farmer-claim/visit-review', userType: farmerClaim })
      expect(application.getClaim).toHaveBeenCalledTimes(1)
      expect(application.getClaim).toHaveBeenCalledWith(validEmail, res.request.yar.id)
      expect(session.setClaim).toHaveBeenCalledTimes(1)
      expect(session.setClaim).toHaveBeenCalledWith(res.request, 'vetVisit', claimWithVisit.vetVisit)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toEqual('Email has been sent')
      expect($('form input[name=email]').val()).toEqual(validEmail)

      cacheGetSpy.mockRestore()
      cacheSetSpy.mockRestore()
    })

    test.each([
      { email: validEmail },
      { email: `  ${validEmail}  ` }
    ])('with known email sends email (email = $email)', async ({ email }) => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, email },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      expect(sendEmail).toHaveBeenCalledWith(
        templateIdFarmerClaimLogin,
        validEmail,
        expect.objectContaining(
          { personalisation: { magiclink: expect.stringMatching(new RegExp(`${serviceUri}/verify-login\\?token=${uuidRegex}&email=${validEmail}`)) }, reference: expect.stringMatching(new RegExp(uuidRegex)) })
      )
    })

    test('with known email returns error when problem sending email', async () => {
      sendEmail.mockResolvedValue(false)
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, email: validEmail },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(500)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toEqual('Sorry, there is a problem with the service')
    })

    test('returns 400 and error message when no claim exists', async () => {
      application.getClaim.mockResolvedValue(null)
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, email: validEmail },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      pageExpects.errors($, `No application found for ${validEmail}`)
      expect(application.getClaim).toHaveBeenCalledTimes(1)
      expect(application.getClaim).toHaveBeenCalledWith(validEmail, res.request.yar.id)
      expect(sendEmail).not.toHaveBeenCalled()
      expect(session.setClaim).not.toHaveBeenCalled()
    })

    test('returns 400 and error message when claim exists with no vet visit', async () => {
      application.getClaim.mockResolvedValue({})
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, email: validEmail },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      pageExpects.errors($, 'No vet visit has been completed.')
      expect(application.getClaim).toHaveBeenCalledTimes(1)
      expect(application.getClaim).toHaveBeenCalledWith(validEmail, res.request.yar.id)
      expect(sendEmail).not.toHaveBeenCalled()
      expect(session.setClaim).not.toHaveBeenCalled()
    })
  })
})
