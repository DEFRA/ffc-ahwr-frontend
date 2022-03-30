const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')

describe('Vet check email page test', () => {
  const url = '/vet/check-email'
  const session = require('../../../../../app/session')
  jest.mock('../../../../../app/session')

  describe(`GET ${url} route`, () => {
    test('returns 200 when not logged in', async () => {
      const email = 'email@test.com'
      const options = {
        method: 'GET',
        url
      }
      session.getVetSignup.mockReturnValue(email)

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toEqual('Check your email')
      expect($('title').text()).toEqual('Check your email')
      expect($('#email').text()).toEqual(email)
      expectPhaseBanner.ok($)
    })
  })
})
