const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const session = require('../../../../../app/session')
const getCrumbs = require('../../../../utils/get-crumbs')
const visitDate = new Date(2022, 4, 12)
let crumb
session.getVetVisitData = jest.fn().mockReturnValue({
  visitDate,
  data: {
    cattle: 'yes',
    cattleType: 'beef'
  }
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
      expect($('.govuk-summary-list__value').eq(0).text()).toMatch(visitDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }))
      expect($('.govuk-summary-list__actions .govuk-link').eq(0).text()).toMatch('Change')
    })
  })

  describe(`POST ${url} route`, () => {
    test('redirect beef eligibility if beef is selected', async () => {
      crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet/beef-eligibility')
      expect(session.getVetVisitData).toHaveBeenCalledTimes(3)
    })
  })
})
