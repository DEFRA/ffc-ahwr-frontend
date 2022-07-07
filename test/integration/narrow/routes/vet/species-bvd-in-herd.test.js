const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const species = require('../../../../../app/constants/species')
const { journeys: { vet: { title } } } = require('../../../../../app/config')

const session = require('../../../../../app/session')
jest.mock('../../../../../app/session')

describe('Vet species bvd in herd test', () => {
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET species bvd in herd test route', () => {
    test.each([
      { species: species.beef },
      { species: species.dairy }
    ])('returns 200', async ({ species }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species } })
      const url = `/vet/${species}-bvd-in-herd`
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toMatch('Was there evidence of circulating BVD virus within the herd?')
      expect($('title').text()).toEqual(`Was there evidence of circulating BVD virus within the herd? - ${title}`)
      const backLink = $('.govuk-back-link')
      expect(backLink.text()).toMatch('Back')
      expect(backLink.attr('href')).toMatch(`/vet/${species}-test`)
      expectPhaseBanner.ok($)
    })

    test.each([
      { species: species.beef },
      { species: species.dairy },
      { species: species.pigs }
    ])('when not logged in redirects to /vet', async ({ species }) => {
      const url = `/vet/${species}-bvd-in-herd`
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
      const url = `/vet/${species}-bvd-in-herd`
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
      { species: species.beef, speciesBvdInHerd: 'no', nextPage: '/vet/review-report' },
      { species: species.dairy, speciesBvdInHerd: 'no', nextPage: '/vet/review-report' },
      { species: species.beef, speciesBvdInHerd: 'yes', nextPage: '/vet/review-report' },
      { species: species.dairy, speciesBvdInHerd: 'yes', nextPage: '/vet/review-report' }
    ])('returns 302 to next page when acceptable answer given', async ({ species, speciesBvdInHerd, nextPage }) => {
      session.getVetVisitData.mockReturnValue({ data: { whichReview: species } })
      const url = `/vet/${species}-bvd-in-herd`
      const options = {
        method,
        url,
        payload: { crumb, speciesBvdInHerd },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(nextPage)
    })

    test.each([
      { species: species.beef, speciesBvdInHerd: null },
      { species: species.dairy, speciesBvdInHerd: null },
      { species: species.pigs, speciesBvdInHerd: null },
      { species: species.beef, speciesBvdInHerd: undefined },
      { species: species.dairy, speciesBvdInHerd: undefined },
      { species: species.pigs, speciesBvdInHerd: undefined },
      { species: species.beef, speciesBvdInHerd: 'wrong' },
      { species: species.dairy, speciesBvdInHerd: 'wrong' },
      { species: species.pigs, speciesBvdInHerd: 'wrong' },
      { species: species.beef, speciesBvdInHerd: '' },
      { species: species.dairy, speciesBvdInHerd: '' },
      { species: species.pigs, speciesBvdInHerd: '' }
    ])('returns error when unacceptable answer is given', async ({ species, speciesBvdInHerd }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species } })
      const url = `/vet/${species}-bvd-in-herd`
      const options = {
        method,
        url,
        payload: { crumb, speciesBvdInHerd },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      const $ = cheerio.load(res.payload)
      expect($('p.govuk-error-message').text()).toMatch('Select yes if test results showed evidence BVD was circulating within the herd')
      expect(res.statusCode).toBe(400)
    })

    test.each([
      { species: species.beef },
      { species: species.dairy },
      { species: species.pigs }
    ])('when not logged in redirects to /vet', async ({ species }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species } })
      const url = `/vet/${species}-bvd-in-herd`
      const options = {
        method,
        url,
        payload: { crumb, speciesBvdInHerd: 'no' },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet')
    })
  })
})
