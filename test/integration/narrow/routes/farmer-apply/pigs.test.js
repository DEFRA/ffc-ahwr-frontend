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

    test('when not logged in redirects to /login with last page as next param', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(`/login?next=${encodeURIComponent(url)}`)
    })
  })

  describe(`POST ${url} route`, () => {
    test('returns 302', async () => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, pigs: 'yes' },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/farmer-apply/check-answers')
    })

    test('returns Error', async () => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, pigs: null },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }
      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)
      expect($('p.govuk-error-message').text()).toMatch('Select yes if you keep more than 50 pigs')
      expect(res.statusCode).toBe(200)
    })

    test('when not logged in redirects to /login with last page as next param', async () => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, pigs: 'no' },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(`/login?next=${encodeURIComponent(url)}`)
    })
  })
})
