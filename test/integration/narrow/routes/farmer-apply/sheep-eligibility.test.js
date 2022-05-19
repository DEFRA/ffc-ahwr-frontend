const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')

describe('sheep eligibility test', () => {
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }
  const url = '/farmer-apply/sheep-eligibility'

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
      expect($('h1').text()).toMatch('Will you have at least 21 sheep on the date of the review?')
      expect($('title').text()).toEqual('Will you have at least 21 sheep on the date of the review?')
      expect($('.govuk-hint').text()).toMatch('You are only eligible for funding if you are keeping more than 20 sheep at the registered site on the date the vet visits.')
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
      { sheep: 'no', nextPage: '/farmer-apply/not-eligible' },
      { sheep: 'yes', nextPage: '/farmer-apply/check-answers' }
    ])('returns 302 to next page when acceptable answer given', async ({ sheep, nextPage }) => {
      const options = {
        method,
        url,
        payload: { crumb, sheep },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(nextPage)
    })

    test.each([
      { sheep: null },
      { sheep: undefined },
      { pigs: 'wrong' },
      { sheep: '' }
    ])('returns error when unacceptable answer is given', async ({ sheep }) => {
      const options = {
        method,
        url,
        payload: { crumb, sheep },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      const $ = cheerio.load(res.payload)
      expect($('p.govuk-error-message').text()).toMatch('Select yes if you have at least 21 sheep on the date of the review')
      expect(res.statusCode).toBe(200)
    })

    test('when not logged in redirects to /farmer-apply/login', async () => {
      const options = {
        method,
        url,
        payload: { crumb, sheep: 'no' },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/farmer-apply/login')
    })
  })
})
