const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const getCrumbs = require('../../../../utils/get-crumbs')
const species = require('../../../../../app/constants/species')
const { journeys: { vet: { title } } } = require('../../../../../app/config')

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
      { speciesTest: species.pigs, data: { whichReview: species.pigs }, elgibleSpecies: 'No', speciesTestText: 'PRRS in herd', speciesTestValue: 'no', speciesTestResultValue: 'No', reviewReport: 'No' },
      { speciesTest: species.sheep, data: { whichReview: species.sheep }, elgibleSpecies: 'No', speciesTestText: 'Percentage reduction in eggs per gram (EPG)', speciesTestValue: 100, speciesTestResultValue: 100, reviewReport: 'No' },
      { speciesTest: species.beef, data: { whichReview: species.beef }, elgibleSpecies: 'No', speciesTestText: 'BVD in herd', speciesTestValue: 'no', speciesTestResultValue: 'No', reviewReport: 'No' },
      { speciesTest: species.dairy, data: { whichReview: species.dairy }, elgibleSpecies: 'No', speciesTestText: 'BVD in herd', speciesTestValue: 'no', speciesTestResultValue: 'No', reviewReport: 'No' },
      { speciesTest: species.pigs, data: { whichReview: species.pigs }, elgibleSpecies: 'Yes', speciesTestText: 'PRRS in herd', speciesTestValue: 'yes', speciesTestResultValue: 'Yes', reviewReport: 'Yes' },
      { speciesTest: species.sheep, data: { whichReview: species.sheep }, elgibleSpecies: 'Yes', speciesTestText: 'Percentage reduction in eggs per gram (EPG)', speciesTestValue: 0, speciesTestResultValue: 0, reviewReport: 'Yes' },
      { speciesTest: species.beef, data: { whichReview: species.beef }, elgibleSpecies: 'Yes', speciesTestText: 'BVD in herd', speciesTestValue: 'yes', speciesTestResultValue: 'Yes', reviewReport: 'Yes' },
      { speciesTest: species.dairy, data: { whichReview: species.dairy }, elgibleSpecies: 'Yes', speciesTestText: 'BVD in herd', speciesTestValue: 'yes', speciesTestResultValue: 'Yes', reviewReport: 'Yes' }
    ])('returns 200 with answers for specific claim type - $speciesTest', async ({ data, elgibleSpecies, speciesTestText, speciesTestValue, speciesTestResultValue, reviewReport }) => {
      const visitDate = new Date(2022, 4, 12)
      session.getVetVisitData.mockReturnValueOnce({
        farmerApplication: {
          data
        },
        visitDate,
        eligibleSpecies: elgibleSpecies.toLowerCase(),
        speciesTest: speciesTestValue,
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
      expect($('title').text()).toEqual(`Check your answers - ${title}`)
      expect($('#back').attr('href')).toEqual('/vet/review-report')
      expectPhaseBanner.ok($)
      expect($('.govuk-summary-list__key').eq(0).text()).toMatch('Farm visit date')
      expect($('.govuk-summary-list__value').eq(0).text()).toMatch(visitDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }))
      expect($('.govuk-summary-list__actions .govuk-link').eq(0).text()).toMatch('Change')
      expect($('.govuk-summary-list__key').eq(1).text()).toMatch('Eligible number of animals')
      expect($('.govuk-summary-list__value').eq(1).text()).toMatch(elgibleSpecies)
      expect($('.govuk-summary-list__actions .govuk-link').eq(1).text()).toMatch('Change')
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
