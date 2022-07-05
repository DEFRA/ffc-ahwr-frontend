const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')

const session = require('../../../../../app/session')
jest.mock('../../../../../app/session')

session.getVetVisitData.mockReturnValue({ data: { whichReview: 'pigs' } })

describe('Farmert review report test', () => {
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }
  const url = '/vet/review-report'
  describe(`GET ${url} route`, () => {
    test.each([
      { expectedBackLink: '/vet/sheep-test', sheepWormsValue: 'yes' },
      { expectedBackLink: '/vet/sheep-worms', sheepWormsValue: 'no' }
    ])('returns 200', async ({ expectedBackLink, sheepWormsValue }) => {
      session
        .getVetVisitData.mockReturnValueOnce({ data: { whichReview: 'sheep' } })
        .mockReturnValueOnce({ data: { whichReview: 'sheep' } })
        .mockReturnValueOnce(sheepWormsValue)
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toMatch('Have you given the farmer a written report of the review?')
      expect($('.govuk-hint').text()).toMatch('The report must include follow-up actions and recommendations. It will not be shared with Defra.')
      const backLink = $('.govuk-back-link')
      expect(backLink.text()).toMatch('Back')
      expect(backLink.attr('href')).toMatch(expectedBackLink)
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
      { reviewReport: 'yes', nextPage: '/vet/check-answers' },
      { reviewReport: 'no', nextPage: '/vet/provide-report' }
    ])('returns 302 to next page when acceptable answer given', async ({ reviewReport, nextPage }) => {
      const options = {
        method,
        url,
        payload: { crumb, reviewReport },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(nextPage)
    })

    test.each([
      { reviewReport: null },
      { reviewReport: undefined },
      { reviewReport: 'wrong' },
      { reviewReport: '' }
    ])('returns error when unacceptable answer is given', async ({ reviewReport }) => {
      const options = {
        method,
        url,
        payload: { crumb, reviewReport },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      const $ = cheerio.load(res.payload)
      expect($('p.govuk-error-message').text()).toMatch('Select yes if you have given the farmer a written report of the review')
      expect(res.statusCode).toBe(400)
    })

    test('when not logged in redirects to /vet', async () => {
      const options = {
        method,
        url,
        payload: { crumb, reviewReport: 'no' },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet')
    })
  })
})
