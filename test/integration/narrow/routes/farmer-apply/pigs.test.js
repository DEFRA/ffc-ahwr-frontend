const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')

describe('Pigs test', () => {
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }
  const url = '/farmer-apply/pigs'

  describe(`GET ${url} route`, () => {
    test('returns 200', async () => {
      const options = {
        method: 'GET',
        url,
        auth
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toMatch('Do you keep more than 50 pigs?')
      expect($('title').text()).toEqual('Pig Numbers')
      expectPhaseBanner.ok($)
    })

    test('when not logged in redirects to /farmer-apply/login', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/farmer-apply/login')
    })
  })

  describe(`POST ${url} route`, () => {
    let crumb
    const method = 'POST'

    beforeEach(async () => {
      crumb = await getCrumbs(global.__SERVER__)
    })

    test.each([
      { pigs: 'no' },
      { pigs: 'yes' }
    ])('returns 302 to next page when acceptable answer given', async ({ pigs }) => {
      const options = {
        method,
        url,
        payload: { crumb, pigs },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/farmer-apply/check-answers')
    })

    test.each([
      { pigs: null },
      { pigs: undefined },
      { sheep: 'wrong' },
      { pigs: '' }
    ])('returns error when unacceptable answer is given', async ({ pigs }) => {
      const options = {
        method,
        url,
        payload: { crumb, pigs },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      const $ = cheerio.load(res.payload)
      expect($('p.govuk-error-message').text()).toMatch('Select yes if you keep more than 50 pigs')
      expect(res.statusCode).toBe(200)
    })

    test('when not logged in redirects to /farmer-apply/login', async () => {
      const options = {
        method,
        url,
        payload: { crumb, pigs: 'no' },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/farmer-apply/login')
    })
  })
})
