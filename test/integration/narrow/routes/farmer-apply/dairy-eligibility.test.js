const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')

describe('dairy eligibility test', () => {
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }
  const url = '/farmer-apply/dairy-eligibility'

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
      expect($('h1').text()).toMatch('Will you have at least 11 dairy cattle on the date of the review?')
      expect($('title').text()).toEqual('Will you have at least 11 dairy cattle on the date of the review?')
      expect($('.govuk-hint').text()).toMatch('You are only eligible for funding if you are keeping more than 10 dairy cattle at the registered site on the date the vet visits.')
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
      { dairy: 'no', nextPage: '/farmer-apply/not-eligible' },
      { dairy: 'yes', nextPage: '/farmer-apply/check-answers' }
    ])('returns 302 to next page when acceptable answer given', async ({ dairy, nextPage }) => {
      const options = {
        method,
        url,
        payload: { crumb, dairy },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(nextPage)
    })

    test.each([
      { dairy: null },
      { dairy: undefined },
      { sheep: 'wrong' },
      { dairy: '' }
    ])('returns error when unacceptable answer is given', async ({ dairy }) => {
      const options = {
        method,
        url,
        payload: { crumb, dairy },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      const $ = cheerio.load(res.payload)
      expect($('p.govuk-error-message').text()).toMatch('Select yes if you have at least 11 dairy cattle on the date of the review')
      expect(res.statusCode).toBe(200)
    })

    test('when not logged in redirects to /farmer-apply/login', async () => {
      const options = {
        method,
        url,
        payload: { crumb, dairy: 'no' },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/farmer-apply/login')
    })
  })
})
