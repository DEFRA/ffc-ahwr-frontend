const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')

describe('Sheep EPG  test', () => {
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }
  const url = '/vet/sheep-epg'

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
      expect($('h1').text()).toMatch('Percentage reduction in eggs per gram (EPG) from pre- to post- worming treatment')
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
      { epg: 50 },
      { epg: 2 }
    ])('returns 302 to next page when acceptable answer given', async ({ epg }) => {
      const options = {
        method,
        url,
        payload: { crumb, epg },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet/declaration')
    })

    test.each([
      { epg: 200 },
      { epg: -80 },
    ])('returns error when unacceptable answer is given', async ({ epg }) => {
      const options = {
        method,
        url,
        payload: { crumb, epg },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      const $ = cheerio.load(res.payload)
      expect($('p.govuk-error-message').text()).toContain('Error:')
      expect(res.statusCode).toBe(400)
    })

    test('when not logged in redirects to /vet', async () => {
      const options = {
        method,
        url,
        payload: { crumb, sheep: 'no' },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet')
    })
  })
})
