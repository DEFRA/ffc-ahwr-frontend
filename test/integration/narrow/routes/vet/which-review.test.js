const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')

describe('Cattle Type test', () => {
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }
  const url = '/vet/which-review'

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
      expect($('h1').text()).toMatch('Which livestock do you want a review for?')
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
      { whichReview: 'beef' },
      { whichReview: 'sheep' },
      { whichReview: 'sheep' },
      { whichReview: 'dairy' }
    ])('returns 302 to beef when answer is acceptable', async ({ whichReview }) => {
      const options = {
        method,
        url,
        payload: { crumb, 'which-review': whichReview },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(`/vet/${whichReview}-eligibility`)
    })

    test.each([
      { whichReview: null },
      { whichReview: undefined },
      { whichReview: 'wrong' },
      { whichReview: '' }
    ])('returns error when unacceptable answer is given', async ({ whichReview }) => {
      const options = {
        method,
        url,
        payload: { crumb, 'which-review': whichReview },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      const $ = cheerio.load(res.payload)
      expect($('p.govuk-error-message').text()).toMatch('Select the type of livestock that you keep')
      expect(res.statusCode).toBe(200)
      expectPhaseBanner.ok($)
    })

    test('when not logged in redirects to /vet/login', async () => {
      const options = {
        method,
        url,
        payload: { crumb, 'which-review': 'xyz' },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet')
    })
  })
})
