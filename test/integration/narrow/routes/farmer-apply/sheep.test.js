const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')

describe('Sheep test', () => {
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }
  const url = '/farmer-apply/sheep'

  describe(`GET ${url} route`, () => {
    const session = require('../../../../../app/session')
    jest.mock('../../../../../app/session')

    afterAll(() => {
      jest.resetAllMocks()
    })

    test.each([
      { answer: 'no' },
      { answer: undefined }
    ])('returns 200 with backlink to cattle when no answers exist for cattle - %p', async ({ answer }) => {
      const options = {
        method: 'GET',
        url,
        auth
      }
      session.getApplication.mockReturnValue(answer)

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-back-link').attr('href')).toEqual('/farmer-apply/cattle')
      expect($('h1').text()).toMatch('Do you keep more than 20 sheep?')
      expect($('title').text()).toEqual('Sheep Numbers')
      expectPhaseBanner.ok($)
    })

    test('returns 200 with backlink to cattle-type when answers exist for cattle', async () => {
      const options = {
        method: 'GET',
        url,
        auth
      }
      session.getApplication.mockReturnValue('yes')

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-back-link').attr('href')).toEqual('/farmer-apply/cattle-type')
    })

    test('when not logged in redirects to /farmer-apply/login with last page as next param', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(`/farmer-apply/login?next=${encodeURIComponent(url)}`)
    })
  })

  describe(`POST ${url} route`, () => {
    test('returns 302 to pigs route', async () => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, sheep: 'yes' },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/farmer-apply/pigs')
    })

    test('returns Error when payload is invalid', async () => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, sheep: null },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      const $ = cheerio.load(res.payload)
      expect($('p.govuk-error-message').text()).toMatch('Select yes if you keep more than 20 sheep')
      expect(res.statusCode).toBe(200)
    })

    test('when not logged in redirects to /farmer-apply/login with last page as next param', async () => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, sheep: 'no' },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(`/farmer-apply/login?next=${encodeURIComponent(url)}`)
    })
  })
})
