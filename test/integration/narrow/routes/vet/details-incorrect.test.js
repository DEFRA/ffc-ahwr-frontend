const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')

describe('Vet - review details incorrect page test', () => {
  const url = '/vet/details-incorrect'

  describe(`GET ${url} route when logged in`, () => {
    test('returns 200', async () => {
      const options = {
        auth: { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' },
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toEqual('Claim details incorrect')
      expectPhaseBanner.ok($)
    })
  })

  describe(`GET ${url} route when not logged in`, () => {
    test('redirects to /vet', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet')
    })
  })
})
