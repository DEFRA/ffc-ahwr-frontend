const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const species = require('../../../../../app/constants/species')
const session = require('../../../../../app/session')
jest.mock('../../../../../app/session')

describe('Sheep worms test', () => {
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }
  const url = '/vet/sheep-worms'

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
      expect($('h1').text()).toMatch('Were there worms in the first check?')
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
      { sheepWorms: 'yes', redirectUrl: '/vet/sheep-worming-treatment' },
      { sheepWorms: 'no', redirectUrl: '/vet/sheep-test' }
    ])('returns 302 to next page when acceptable answer given', async ({ sheepWorms, redirectUrl }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species.sheep } })
      const options = {
        method,
        url,
        payload: { crumb, sheepWorms },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(redirectUrl)
    })

    test.each([
      { sheepWorms: null },
      { reviewReport: undefined },
      { reviewReport: 'wrong' },
      { reviewReport: '' }
    ])('returns error when unacceptable answer is given', async ({ sheepWorms }) => {
      const options = {
        method,
        url,
        payload: { crumb, sheepWorms },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }
      const res = await global.__SERVER__.inject(options)

      const $ = cheerio.load(res.payload)
      expect($('p.govuk-error-message').text()).toMatch('Select yes if the first check showed worms')
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
