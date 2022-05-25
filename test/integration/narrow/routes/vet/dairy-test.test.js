const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')

describe('Dairy test bvd test', () => {
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }
  const url = '/vet/dairy-test'

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
      expect($('h1').text()).toMatch('Did testing results show that BVD is in the herd?')
      expectPhaseBanner.ok($)
    })

    test('when not logged in redirects to /vet', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet')
    })
  })

  describe(`POST ${url} route`, () => {
    let crumb
    const method = 'POST'

    beforeEach(async () => {
      crumb = await getCrumbs(global.__SERVER__)
    })

    test.each([
      { dairyTest: 'no' },
      { dairyTest: 'yes' }
    ])('returns 302 to next page when acceptable answer given', async ({ dairyTest }) => {
      const options = {
        method,
        url,
        payload: { crumb, dairyTest },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet/review-report')
    })

    test.each([
      { dairyTest: null },
      { dairyTest: undefined },
      { dairyTest: 'wrong' },
      { dairyTest: '' }
    ])('returns error when unacceptable answer is given', async ({ dairyTest }) => {
      const options = {
        method,
        url,
        payload: { crumb, dairyTest },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      const $ = cheerio.load(res.payload)
      expect($('p.govuk-error-message').text()).toMatch('Select yes if BVD was found in the herd')
      expect(res.statusCode).toBe(400)
    })

    test('when not logged in redirects to /vet', async () => {
      const options = {
        method,
        url,
        payload: { crumb, dairyTest: 'no' },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet')
    })
  })
})
