const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')

describe('Cows BVD present breeder test', () => {
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }
  const url = '/vet/cows-bvd-present-breeder'

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
      expect($('h1').text()).toMatch('Did antibody test results show that BVD is in the herd?')
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
      { vetBvdResult: 'no' },
      { vetBvdResult: 'yes' },
      { vetBvdResult: 'further investigation required' }
    ])('returns 302 to next page when acceptable answer given', async ({ vetBvdResult }) => {
      const options = {
        method,
        url,
        payload: { crumb, vetBvdResult },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet/declaration')
    })

    test.each([
      { vetBvdResult: null },
      { vetBvdResult: undefined },
      { vetBvdResult: 'wrong' },
      { vetBvdResult: '' }
    ])('returns error when unacceptable answer is given', async ({ vetBvdResult }) => {
      const options = {
        method,
        url,
        payload: { crumb, vetBvdResult },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      const $ = cheerio.load(res.payload)
      expect($('p.govuk-error-message').text()).toMatch('Select yes if BVD was found in the herd')
      expect(res.statusCode).toBe(200)
    })

    test('when not logged in redirects to /vet', async () => {
      const options = {
        method,
        url,
        payload: { crumb, vetBvdResult: 'no' },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet')
    })
  })
})
