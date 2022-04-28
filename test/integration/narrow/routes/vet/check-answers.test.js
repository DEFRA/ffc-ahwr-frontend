const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const session = require('../../../../../app/session')

session.getVetVisitData = jest.fn().mockReturnValue({
  visitDateItems: [
    { name: 'day', classes: 'govuk-input--width-2', value: 12 },
    { name: 'month', classes: 'govuk-input--width-2', value: 4 },
    { name: 'year', classes: 'govuk-input--width-4', value: 2022 }
  ]
})

describe('Vet check answers test', () => {
  afterAll(() => {
    jest.resetAllMocks()
  })

  const auth = { credentials: {}, strategy: 'cookie' }
  const url = '/vet/check-answers'

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
      expect($('h1.govuk-heading-l').text()).toEqual('Check your answers')
      expect($('title').text()).toEqual('Check your answers')
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

    test('does not show beef and dairy option when cattle is not selected is both', async () => {
      const options = {
        method: 'GET',
        url,
        auth
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-summary-list__row').length).toEqual(1)
      expect($('.govuk-summary-list__key').eq(0).text()).toMatch('Farm visit date')
      expect($('.govuk-summary-list__value').eq(0).text()).toMatch('12 4 2022')
      expect($('.govuk-summary-list__actions .govuk-link').eq(0).text()).toMatch('Change')
    })
  })
})
