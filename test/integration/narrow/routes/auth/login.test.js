const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const expectLoginPage = require('../../../../utils/login-page-expect')
const getCrumbs = require('../../../../utils/get-crumbs')
const { cookie: cookieConfig } = require('../../../../../app/config')

describe('Login page test', () => {
  let server
  const url = '/login'
  const createServer = require('../../../../../app/server')

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
  })

  test('GET /login route returns 200', async () => {
    const options = {
      method: 'GET',
      url
    }

    const res = await server.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expectPhaseBanner.ok($)
    expectLoginPage.content($)
  })

  test('POST to /login route returns 400 when request contains empty payload', async () => {
    const crumb = await getCrumbs(server)
    const options = {
      method: 'POST',
      url: '/login',
      payload: { crumb, crn: '', password: '' },
      headers: { cookie: `crumb=${crumb}` }
    }

    const res = await server.inject(options)

    expect(res.statusCode).toBe(400)
    const $ = cheerio.load(res.payload)
    expectPhaseBanner.ok($)
    expectLoginPage.content($)
    expectLoginPage.errors($)
  })

  test('POST to /login route returns 400 when request contains incorrect crn payload', async () => {
    const crumb = await getCrumbs(server)
    const crn = 'invalid'
    const options = {
      method: 'POST',
      url: '/login',
      payload: { crumb, crn, password: 'invalid' },
      headers: { cookie: `crumb=${crumb}` }
    }

    const res = await server.inject(options)

    expect(res.statusCode).toBe(400)
    const $ = cheerio.load(res.payload)
    expectPhaseBanner.ok($)
    expectLoginPage.content($)
    expect($('.govuk-error-summary').length).toEqual(1)
    expect($('.govuk-error-message').length).toEqual(2)
    expect($('.govuk-error-message').eq(0).text()).toMatch('"crn" length must be 10 characters long')
    expect($('.govuk-error-message').eq(1).text()).toMatch(`"crn" with value "${crn}" fails to match the required pattern: /^\\d+$/`)
  })

  test.each([
    { crumb: '' },
    { crumb: undefined }
  ])('POST to /login route returns 403 when request does not contain crumb', async ({ crumb }) => {
    const options = {
      method: 'POST',
      url: '/login',
      payload: { crumb },
      headers: { cookie: `crumb=${crumb}` }
    }

    const res = await server.inject(options)

    expect(res.statusCode).toBe(403)
    const $ = cheerio.load(res.payload)
    expectPhaseBanner.ok($)
    expect($('.govuk-heading-l').text()).toEqual('403 - Forbidden')
  })

  test('POST to /login route with valid payload redirects to /cph-list', async () => {
    const crumb = await getCrumbs(server)
    const crn = '1234567890'
    const options = {
      method: 'POST',
      url: '/login',
      payload: { crumb, crn, password: 'invalid' },
      headers: { cookie: `crumb=${crumb}` }
    }

    const res = await server.inject(options)

    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toEqual('/cph-list')
  })

  test('GET to /login route when already logged in redirects to /cph-list', async () => {
    const crumb = await getCrumbs(server)
    const crn = '1234567890'

    const initialRes = await server.inject({
      method: 'POST',
      url: '/login',
      payload: { crumb, crn, password: 'invalid' },
      headers: { cookie: `crumb=${crumb}` }
    })

    expect(initialRes.statusCode).toBe(302)
    expect(initialRes.headers.location).toEqual('/cph-list')

    const cookieHeader = initialRes.headers['set-cookie']
    const authCookieValue = cookieHeader[0].split('; ').find(x => x.startsWith(cookieConfig.authCookieName))

    const options = {
      method: 'GET',
      url: '/login',
      headers: { cookie: `crumb=${crumb}; ${authCookieValue}` }
    }

    const res = await server.inject(options)

    expect(res.statusCode).toBe(302)
    expect(initialRes.headers.location).toEqual('/cph-list')
  })
})
