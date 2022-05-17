const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const getCrumbs = require('../../../../utils/get-crumbs')

jest.mock('../../../../../app/session')
const session = require('../../../../../app/session')

describe('Vet check answers test', () => {
  let crumb
  const auth = { credentials: {}, strategy: 'cookie' }
  const url = '/vet/check-answers'

  describe(`GET ${url} route`, () => {
    afterAll(() => {
      jest.resetAllMocks()
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

    test.each([
      { species: 'pigs', data: { pigs: 'yes' }, elgibleNumberOfAnimals: 'yes', speciesTestText: 'PRRS in herd', speciesTestValue: { pigsTest: 'yes' }, speciesTestResultValue: 'yes', reviewReport: 'yes' },
      { species: 'sheep', data: { sheep: 'yes' }, elgibleNumberOfAnimals: 'yes', speciesTestText: 'Worming treatment effectiveness', speciesTestValue: { sheepTest: 'yes' }, speciesTestResultValue: 'yes', reviewReport: 'yes' },
      { species: 'beef', data: { cattle: 'yes', cattleType: 'beef' }, elgibleNumberOfAnimals: 'yes', speciesTestText: 'BVD in herd', speciesTestValue: { beefTest: 'yes' }, speciesTestResultValue: 'yes', reviewReport: 'yes' },
      { species: 'dairy', data: { cattle: 'yes', cattleType: 'dairy' }, elgibleNumberOfAnimals: 'yes', speciesTestText: 'BVD in herd', speciesTestValue: { dairyTest: 'yes' }, speciesTestResultValue: 'yes', reviewReport: 'yes' }
    ])('returns 200 with answers for specific claim type - $species', async ({ species, data, elgibleNumberOfAnimals, speciesTestText, speciesTestValue, speciesTestResultValue, reviewReport }) => {
      const visitDate = new Date(2022, 4, 12)
      session.getVetVisitData.mockReturnValueOnce({
        farmerApplication: {
          data
        },
        visitDate,
        sheep: species === 'sheep' ? 'yes' : 'no',
        pigs: species === 'pigs' ? 'yes' : 'no',
        beef: species === 'beef' ? 'yes' : 'no',
        dairy: species === 'dairy' ? 'yes' : 'no',
        ...speciesTestValue,
        reviewReport
      })
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
      expect($('#back').attr('href')).toEqual('/vet/review-report')
      expectPhaseBanner.ok($)
      expect($('.govuk-summary-list__row').length).toEqual(4)
      expect($('.govuk-summary-list__key').eq(0).text()).toMatch('Farm visit date')
      expect($('.govuk-summary-list__value').eq(0).text()).toMatch(visitDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }))
      expect($('.govuk-summary-list__actions .govuk-link').eq(0).text()).toMatch('Change')
      expect($('.govuk-summary-list__key').eq(1).text()).toMatch('Eligible number of animals')
      expect($('.govuk-summary-list__value').eq(1).text()).toMatch(elgibleNumberOfAnimals)
      expect($('.govuk-summary-list__actions .govuk-link').eq(1).text()).toMatch('Change')
      expect($('.govuk-summary-list__key').eq(2).text()).toMatch(speciesTestText)
      expect($('.govuk-summary-list__value').eq(2).text()).toMatch(speciesTestResultValue)
      expect($('.govuk-summary-list__actions .govuk-link').eq(2).text()).toMatch('Change')
      expect($('.govuk-summary-list__key').eq(3).text()).toMatch('Written report given to farmer')
      expect($('.govuk-summary-list__value').eq(3).text()).toMatch(reviewReport)
      expect($('.govuk-summary-list__actions .govuk-link').eq(3).text()).toMatch('Change')
    })
  })

  describe(`POST ${url} route`, () => {
    const method = 'POST'

    test('redirects to declaration', async () => {
      crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method,
        url,
        payload: { crumb },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet/declaration')
    })

    test('when not logged in redirects to /vet', async () => {
      const options = {
        method,
        url,
        payload: { crumb, beefTest: 'no' },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet')
    })
  })
})
