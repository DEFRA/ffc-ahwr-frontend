const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const expectLoginPage = require('../../../../utils/login-page-expect')
const getCrumbs = require('../../../../utils/get-crumbs')
const { cookie: cookieConfig } = require('../../../../../app/config')

describe('Login page test', () => {
  let server
  const url = '/login'
  const createServer = require('../../../../../app/server')
  const validEmail = 'dairy@ltd.com'

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
      payload: { crumb, email: '' },
      headers: { cookie: `crumb=${crumb}` }
    }

    const res = await server.inject(options)

    expect(res.statusCode).toBe(400)
    const $ = cheerio.load(res.payload)
    expectPhaseBanner.ok($)
    expectLoginPage.content($)
    expectLoginPage.errors($, '"email" is not allowed to be empty')
  })

  test.each([
    { email: 'not-an-email', errorMessage: '"email" must be a valid email' },
    { email: '', errorMessage: '"email" is not allowed to be empty' },
    { email: 'missing@email.com', errorMessage: 'No user found for email \'missing@email.com\'' }
  ])('POST to /login route returns 400 when request contains incorrect email', async ({ email, errorMessage }) => {
    const crumb = await getCrumbs(server)
    const options = {
      method: 'POST',
      url: '/login',
      payload: { crumb, email },
      headers: { cookie: `crumb=${crumb}` }
    }

    const res = await server.inject(options)

    expect(res.statusCode).toBe(400)
    const $ = cheerio.load(res.payload)
    expectPhaseBanner.ok($)
    expectLoginPage.content($)
    expectLoginPage.errors($, errorMessage)
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

  test('POST to /login route with known email redirects email sent page with form filled with email', async () => {
    const crumb = await getCrumbs(server)
    const options = {
      method: 'POST',
      url: '/login',
      payload: { crumb, email: validEmail },
      headers: { cookie: `crumb=${crumb}` }
    }

    const res = await server.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('h1').text()).toEqual('Email has been sent')
    expect($('form input[name=email]').val()).toEqual(validEmail)
  })

  // test('GET to /login route when already logged in redirects to /farmer-apply/org-review', async () => {
  //   const crumb = await getCrumbs(server)

  //   const initialRes = await server.inject({
  //     auth: { credentials: { email: validEmail }, strategy: 'basic' },
  //     method: 'POST',
  //     url: '/login',
  //     payload: { crumb, email: validEmail },
  //     headers: { cookie: `crumb=${crumb}` }
  //   })

  //   expect(initialRes.statusCode).toBe(302)
  //   expect(initialRes.headers.location).toEqual('farmer-apply/org-review')

  //   const cookieHeader = initialRes.headers['set-cookie']
  //   const authCookieValue = cookieHeader[0].split('; ').find(x => x.startsWith(cookieConfig.cookieNameAuth))

  //   const options = {
  //     auth: { credentials: { email: validEmail }, strategy: 'basic' },
  //     method: 'GET',
  //     url: '/login',
  //     headers: { cookie: `crumb=${crumb}; ${authCookieValue}` }
  //   }

  //   const res = await server.inject(options)

  //   expect(res.statusCode).toBe(302)
  //   expect(initialRes.headers.location).toEqual('farmer-apply/org-review')
  // })
})
