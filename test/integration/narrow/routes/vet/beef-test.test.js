const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const species = require('../../../../../app/constants/species')
const session = require('../../../../../app/session')
jest.mock('../../../../../app/session')

describe('Beef BVD present test', () => {
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }
  const url = '/vet/beef-test'

  describe(`GET ${url} route`, () => {
    test('returns 200', async () => {
      const options = {
        method: 'GET',
        url,
        auth
      }
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species.beef } })

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toMatch('Did antibody test results show that BVD is in the herd?')
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
  })

  describe(`POST ${url} route`, () => {
    let crumb
    const method = 'POST'

    beforeEach(async () => {
      crumb = await getCrumbs(global.__SERVER__)
    })

    test.each([
      { beefTest: 'no' },
      { beefTest: 'yes' }
    ])('returns 302 to next page when acceptable answer given', async ({ beefTest }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species.beef } })
      const options = {
        method,
        url,
        payload: { crumb, beefTest },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet/review-report')
    })

    test.each([
      { beefTest: null },
      { beefTest: undefined },
      { beefTest: 'wrong' },
      { beefTest: '' }
    ])('returns error when unacceptable answer is given', async ({ beefTest }) => {
      const options = {
        method,
        url,
        payload: { crumb, beefTest },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      const $ = cheerio.load(res.payload)
      expect($('p.govuk-error-message').text()).toMatch('Select yes if BVD was found in the herd')
      expect(res.statusCode).toBe(400)
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
