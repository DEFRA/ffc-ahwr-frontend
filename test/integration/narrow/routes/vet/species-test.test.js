const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const species = require('../../../../../app/constants/species')
const speciesContent = require('../../../../../app/constants/species-test-content-vet')

const session = require('../../../../../app/session')
jest.mock('../../../../../app/session')

describe('Vet species test page test', () => {
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }

  describe('GET species test route', () => {
    test.each([
      { species: species.beef },
      { species: species.dairy },
      { species: species.pigs }
    ])('returns 200', async ({ species }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species } })
      const url = `/vet/${species}-test`
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toMatch(speciesContent[species].legendText)
      expect($('title').text()).toEqual(speciesContent[species].title)
      expectPhaseBanner.ok($)
    })

    test.each([
      { species: species.beef },
      { species: species.dairy },
      { species: species.pigs }
    ])('when not logged in redirects to /vet', async ({ species }) => {
      const url = `/vet/${species}-test`
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet')
    })

    test.each([
      { species: species.beef, whichReview: species.pigs },
      { species: species.dairy, whichReview: species.beef },
      { species: species.pigs, whichReview: species.beef }
    ])('returns error when trying to access diff species review page', async ({ species, whichReview }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview } })
      const url = `/vet/${species}-test`
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(400)
    })
  })

  describe('POST species test route', () => {
    let crumb
    const method = 'POST'

    beforeEach(async () => {
      crumb = await getCrumbs(global.__SERVER__)
    })

    test.each([
      { species: species.beef, speciesTest: 'no' },
      { species: species.dairy, speciesTest: 'no' },
      { species: species.pigs, speciesTest: 'no' },
      { species: species.beef, speciesTest: 'yes' },
      { species: species.dairy, speciesTest: 'yes' },
      { species: species.pigs, speciesTest: 'yes' }
    ])('returns 302 to next page when acceptable answer given', async ({ species, speciesTest }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species } })
      const url = `/vet/${species}-test`
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
      { species: species.beef, speciesTest: null },
      { species: species.dairy, speciesTest: null },
      { species: species.pigs, speciesTest: null },
      { species: species.beef, speciesTest: undefined },
      { species: species.dairy, speciesTest: undefined },
      { species: species.pigs, speciesTest: undefined },
      { species: species.beef, speciesTest: 'wrong' },
      { species: species.dairy, speciesTest: 'wrong' },
      { species: species.pigs, speciesTest: 'wrong' },
      { species: species.beef, speciesTest: '' },
      { species: species.dairy, speciesTest: '' },
      { species: species.pigs, speciesTest: '' }
    ])('returns error when unacceptable answer is given', async ({ species, speciesTest }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species } })
      const url = `/vet/${species}-test`
      const options = {
        method,
        url,
        payload: { crumb, speciesTest },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      const $ = cheerio.load(res.payload)
      expect($('p.govuk-error-message').text()).toMatch(speciesContent[species].errorText)
      expect(res.statusCode).toBe(400)
    })

    test.each([
      { species: species.beef },
      { species: species.dairy },
      { species: species.pigs }
    ])('when not logged in redirects to /vet', async ({ species }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species } })
      const url = `/vet/${species}-test`
      const options = {
        method,
        url,
        payload: { crumb, speciesTest: 'no' },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet')
    })
  })
})
