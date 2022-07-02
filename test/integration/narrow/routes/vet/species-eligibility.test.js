const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const species = require('../../../../../app/constants/species')
const speciesContent = require('../../../../../app/constants/species-content-vet')
const { journeys: { vet: { title } } } = require('../../../../../app/config')

const session = require('../../../../../app/session')
jest.mock('../../../../../app/session')

describe('Vet species eligibility test', () => {
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }

  describe('GET species eligibility route', () => {
    test.each([
      { species: species.beef },
      { species: species.dairy },
      { species: species.pigs },
      { species: species.sheep }
    ])('returns 200', async ({ species }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species } })
      const url = `/vet/${species}-eligibility`
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toMatch(speciesContent[species].legendText)
      expect($('title').text()).toEqual(speciesContent[species].title + ` - ${title}`)
      expectPhaseBanner.ok($)
    })

    test.each([
      { species: species.beef },
      { species: species.dairy },
      { species: species.pigs },
      { species: species.sheep }
    ])('when not logged in redirects to /vet', async ({ species }) => {
      const url = `/vet/${species}-eligibility`
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet')
    })

    test.each([
      { species: species.beef, whichReview: species.sheep },
      { species: species.dairy, whichReview: species.beef },
      { species: species.pigs, whichReview: species.beef },
      { species: species.sheep, whichReview: species.beef }
    ])('returns error when trying to access diff species review page', async ({ species, whichReview }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview } })
      const url = `/vet/${species}-eligibility`
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(400)
    })
  })

  describe('POST species eligibility route', () => {
    let crumb
    const method = 'POST'

    beforeEach(async () => {
      crumb = await getCrumbs(global.__SERVER__)
    })

    test.each([
      { species: species.beef, eligibleSpecies: 'no' },
      { species: species.dairy, eligibleSpecies: 'no' },
      { species: species.pigs, eligibleSpecies: 'no' },
      { species: species.sheep, eligibleSpecies: 'no' },
      { species: species.beef, eligibleSpecies: 'yes' },
      { species: species.dairy, eligibleSpecies: 'yes' },
      { species: species.pigs, eligibleSpecies: 'yes' },
      { species: species.sheep, eligibleSpecies: 'yes' }
    ])('returns 302 to next page when acceptable answer given', async ({ species, eligibleSpecies }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species } })
      const url = `/vet/${species}-eligibility`
      const options = {
        method,
        url,
        payload: { crumb, eligibleSpecies },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(`/vet/${species}-test`)
    })

    test.each([
      { species: species.beef, eligibleSpecies: null },
      { species: species.dairy, eligibleSpecies: null },
      { species: species.pigs, eligibleSpecies: null },
      { species: species.sheep, eligibleSpecies: null },
      { species: species.beef, eligibleSpecies: undefined },
      { species: species.dairy, eligibleSpecies: undefined },
      { species: species.pigs, eligibleSpecies: undefined },
      { species: species.sheep, eligibleSpecies: undefined },
      { species: species.beef, eligibleSpecies: 'wrong' },
      { species: species.dairy, eligibleSpecies: 'wrong' },
      { species: species.pigs, eligibleSpecies: 'wrong' },
      { species: species.sheep, eligibleSpecies: 'wrong' },
      { species: species.beef, eligibleSpecies: '' },
      { species: species.dairy, eligibleSpecies: '' },
      { species: species.pigs, eligibleSpecies: '' },
      { species: species.sheep, eligibleSpecies: '' }
    ])('returns error when unacceptable answer is given', async ({ species, eligibleSpecies }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species } })
      const url = `/vet/${species}-eligibility`
      const options = {
        method,
        url,
        payload: { crumb, eligibleSpecies },
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
      { species: species.pigs },
      { species: species.sheep }
    ])('when not logged in redirects to /vet', async ({ species }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species } })
      const url = `/vet/${species}-eligibility`
      const options = {
        method,
        url,
        payload: { crumb, eligibleSpecies: 'no' },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet')
    })
  })
})
