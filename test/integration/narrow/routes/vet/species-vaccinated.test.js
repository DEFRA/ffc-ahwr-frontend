const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const species = require('../../../../../app/constants/species')
const speciesContent = require('../../../../../app/constants/species-vaccinated-content-vet')
const { journeys: { vet: { title } } } = require('../../../../../app/config')

const session = require('../../../../../app/session')
jest.mock('../../../../../app/session')

describe('Vet species vaccinated test', () => {
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }

  describe('GET species vaccinated route', () => {
    test.each([
      { species: species.beef },
      { species: species.dairy }
    ])('returns 200', async ({ species }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species } })
      const url = `/vet/${species}-vaccinated`
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toMatch(speciesContent[species].title)
      expect($('title').text()).toEqual(speciesContent[species].title + ` - ${title}`)
      const backLink = $('.govuk-back-link')
      expect(backLink.text()).toMatch('Back')
      expect(backLink.attr('href')).toMatch(`/vet/${species}-eligibility`)
      expectPhaseBanner.ok($)
    })

    test.each([
      { species: species.beef },
      { species: species.dairy }
    ])('when not logged in redirects to /vet', async ({ species }) => {
      const url = `/vet/${species}-vaccinated`
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet')
    })

    test.each([
      { species: species.beef, whichReview: species.dairy },
      { species: species.dairy, whichReview: species.beef }
    ])('returns error when trying to access diff species review page', async ({ species, whichReview }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview } })
      const url = `/vet/${species}-vaccinated`
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(400)
    })
  })

  describe('POST species vaccinated route', () => {
    let crumb
    const method = 'POST'

    beforeEach(async () => {
      crumb = await getCrumbs(global.__SERVER__)
    })

    test.each([
      { species: species.beef, speciesVaccinated: 'no', nextPage: '/vet/beef-test' },
      { species: species.dairy, speciesVaccinated: 'no', nextPage: '/vet/dairy-test' },
      { species: species.beef, speciesVaccinated: 'na', nextPage: '/vet/beef-test' },
      { species: species.dairy, speciesVaccinated: 'na', nextPage: '/vet/dairy-test' },
      { species: species.beef, speciesVaccinated: 'fully', nextPage: '/vet/beef-last-vaccinated' },
      { species: species.dairy, speciesVaccinated: 'fully', nextPage: '/vet/dairy-last-vaccinated' },
      { species: species.beef, speciesVaccinated: 'partly', nextPage: '/vet/beef-last-vaccinated' },
      { species: species.dairy, speciesVaccinated: 'partly', nextPage: '/vet/dairy-last-vaccinated' }
    ])('returns 302 to next page when acceptable answer given', async ({ species, speciesVaccinated, nextPage }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species } })
      const url = `/vet/${species}-vaccinated`
      const options = {
        method,
        url,
        payload: { crumb, speciesVaccinated },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(nextPage)
    })

    test.each([
      { species: species.beef, speciesVaccinated: null },
      { species: species.dairy, speciesVaccinated: null },
      { species: species.beef, speciesVaccinated: undefined },
      { species: species.dairy, speciesVaccinated: undefined },
      { species: species.beef, speciesVaccinated: 'wrong' },
      { species: species.dairy, speciesVaccinated: 'wrong' },
      { species: species.beef, speciesVaccinated: '' },
      { species: species.dairy, speciesVaccinated: '' }
    ])('returns error when unacceptable answer is given', async ({ species, speciesVaccinated }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species } })
      const url = `/vet/${species}-vaccinated`
      const options = {
        method,
        url,
        payload: { crumb, speciesVaccinated },
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
      { species: species.dairy }
    ])('when not logged in redirects to /vet', async ({ species }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species } })
      const url = `/vet/${species}-vaccinated`
      const options = {
        method,
        url,
        payload: { crumb, speciesVaccinated: 'no' },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet')
    })
  })
})
