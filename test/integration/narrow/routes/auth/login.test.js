const cheerio = require('cheerio')
const { v4: uuid } = require('uuid')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectLoginPage = require('../../../../utils/login-page-expect')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const { notify: { templateIdFarmerLogin }, serviceUri } = require('../../../../../app/config')
const uuidRegex = require('../../../../../app/config/uuid-regex')

describe('Login page test', () => {
  let sendEmail
  let getByEmail
  const org = { name: 'my-org' }

  beforeAll(async () => {
    jest.resetAllMocks()

    sendEmail = require('../../../../../app/lib/send-email')
    jest.mock('../../../../../app/lib/send-email')
    const orgs = require('../../../../../app/api-requests/users')
    getByEmail = orgs.getByEmail
    jest.mock('../../../../../app/api-requests/users')
  })

  const url = '/login'
  const validEmail = 'dairy@ltd.com'

  describe('GET requests to /login', () => {
    test('returns 200', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expectPhaseBanner.ok($)
      expectLoginPage.hasCorrectContent($)
    })

    test('route when already logged in redirects to org-review', async () => {
      const options = {
        auth: { credentials: { email: validEmail }, strategy: 'cookie', isAuthenticated: true },
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('farmer-apply/org-review')
    })
  })

  describe('POST requests to /login', () => {
    test('request contains empty payload', async () => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, email: '' },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      expectPhaseBanner.ok($)
      expectLoginPage.hasCorrectContent($)
      expectLoginPage.errors($, '"email" is not allowed to be empty')
    })

    test.each([
      { email: 'not-an-email', errorMessage: '"email" must be a valid email' },
      { email: '', errorMessage: '"email" is not allowed to be empty' },
      { email: 'missing@email.com', errorMessage: 'No user found for email \'missing@email.com\'' }
    ])('route returns 400 when request contains incorrect email - %s', async ({ email, errorMessage }) => {
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
      expectLoginPage.hasCorrectContent($)
      expectLoginPage.errors($, errorMessage)
    })

    test.each([
      { crumb: '' },
      { crumb: undefined }
    ])('route returns 403 when request does not contain crumb - $crumb', async ({ crumb }) => {
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

    test('route with known email for the first time redirects to email sent page with form filled with email and adds token to cache', async () => {
      getByEmail.mockResolvedValue(org)
      sendEmail.mockResolvedValue(true)
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

      expect(cacheGetSpy).toHaveBeenCalledTimes(1)
      expect(cacheGetSpy).toHaveBeenCalledWith(validEmail)
      expect(cacheSetSpy).toHaveBeenCalledTimes(2)
      expect(cacheSetSpy).toHaveBeenNthCalledWith(1, validEmail, [expect.stringMatching(new RegExp(uuidRegex))])
      expect(cacheSetSpy).toHaveBeenNthCalledWith(2, expect.stringMatching(new RegExp(uuidRegex)), validEmail)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toEqual('Email has been sent')
      expect($('form input[name=email]').val()).toEqual(validEmail)

      cacheGetSpy.mockRestore()
      cacheSetSpy.mockRestore()
    })

    test('route with known email with an existing token redirects to email sent page and adds token to cache', async () => {
      getByEmail.mockResolvedValue(org)
      sendEmail.mockResolvedValue(true)
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

      expect(cacheGetSpy).toHaveBeenCalledTimes(1)
      expect(cacheGetSpy).toHaveBeenCalledWith(validEmail)
      expect(cacheSetSpy).toHaveBeenCalledTimes(2)
      expect(cacheSetSpy).toHaveBeenNthCalledWith(1, validEmail, [token, expect.stringMatching(new RegExp(uuidRegex))])
      expect(cacheSetSpy).toHaveBeenNthCalledWith(2, expect.stringMatching(new RegExp(uuidRegex)), validEmail)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toEqual('Email has been sent')
      expect($('form input[name=email]').val()).toEqual(validEmail)

      cacheGetSpy.mockRestore()
      cacheSetSpy.mockRestore()
    })

    test('route with known email sends email', async () => {
      getByEmail.mockResolvedValue(org)
      sendEmail.mockResolvedValue(true)
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, email: validEmail },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      expect(sendEmail).toHaveBeenCalledWith(
        templateIdFarmerLogin,
        validEmail,
        expect.objectContaining(
          { personalisation: { magiclink: expect.stringMatching(new RegExp(`${serviceUri}/verify-login\\?token=${uuidRegex}&email=${validEmail}`)) }, reference: expect.stringMatching(new RegExp(uuidRegex)) })
      )
    })

    test('route with known email returns error when problem sending email', async () => {
      getByEmail.mockResolvedValue(org)
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
  })
})
