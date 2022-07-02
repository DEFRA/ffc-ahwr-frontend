const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const species = require('../../../../../app/constants/species')
const session = require('../../../../../app/session')
jest.mock('../../../../../app/session')

describe('Sheep worming test', () => {
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }
  const url = '/vet/sheep-test'

  describe(`GET ${url} route`, () => {
    test('returns 200', async () => {
      const options = {
        method: 'GET',
        url,
        auth
      }
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species.sheep } })

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toMatch('What was the percentage reduction in eggs per gram (EPG) from pre- to post- worming treatment?')
      expectPhaseBanner.ok($)
    })

    test('returns 400 for non-accesible species test page', async () => {
      const options = {
        method: 'GET',
        url,
        auth
      }
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species.pigs } })

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
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
      { speciesTest: 100 },
      { speciesTest: 0 }
    ])('returns 302 to next page when acceptable answer given', async ({ speciesTest }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species.sheep } })
      const options = {
        method,
        url,
        payload: { crumb, speciesTest },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet/review-report')
    })

    test.each([
      { speciesTest: 200, message: 'EPG percentage must be 100 or less' },
      { speciesTest: -80, message: 'EPG percentage must be 0 or more' },
      { speciesTest: null, message: 'Enter a valid EPG percentage' }
    ])('returns error when unacceptable answer is given', async ({ speciesTest, message }) => {
      const options = {
        method,
        url,
        payload: { crumb, speciesTest },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      const $ = cheerio.load(res.payload)
      expect($('p.govuk-error-message').text()).toMatch(message)
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
