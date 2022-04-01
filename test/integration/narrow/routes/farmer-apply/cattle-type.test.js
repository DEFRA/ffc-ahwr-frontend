const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')

describe('Cattle Type test', () => {
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }
  const url = '/farmer-apply/cattle-type'

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
      expect($('h1').text()).toMatch('What type of cattle do you keep?')
      expect($('title').text()).toEqual('Cattle Type')
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
        payload: { crumb, 'cattle-type': 'beef' },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/farmer-apply/sheep')
    })

    test('returns Error', async () => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, 'cattle-type': 'xyz' },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }
      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)
      expect($('p.govuk-error-message').text()).toMatch('Select the type of cattle that you keep')
      expect(res.statusCode).toBe(200)
      expectPhaseBanner.ok($)
    })

    test('when not logged in redirects to /login with last page as next param', async () => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb, 'cattle-type': 'xyz' },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(`/login?next=${encodeURIComponent(url)}`)
    })
  })
})
