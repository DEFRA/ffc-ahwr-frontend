const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const species = require('../../../../../app/constants/species')
const { journeys: { vet: { title } } } = require('../../../../../app/config')

const session = require('../../../../../app/session')
jest.mock('../../../../../app/session')

describe('Vet species vaccinated up to date test', () => {
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }

  describe('GET species vaccinated up to date route', () => {
    test.each([
      { species: species.beef },
      { species: species.dairy }
    ])('returns 200', async ({ species }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species } })
      const url = `/vet/${species}-vaccination-up-to-date`
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toMatch('Are all breeding cattle currently up to date with vaccination?')
      expect($('title').text()).toEqual(`Are all breeding cattle currently up to date with vaccination? - ${title}`)
      const backLink = $('.govuk-back-link')
      expect(backLink.text()).toMatch('Back')
      expect(backLink.attr('href')).toMatch(`/vet/${species}-last-vaccinated`)
      expectPhaseBanner.ok($)
    })

    test.each([
      { species: species.beef },
      { species: species.dairy }
    ])('when not logged in redirects to /vet', async ({ species }) => {
      const url = `/vet/${species}-vaccination-up-to-date`
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
      const url = `/vet/${species}-vaccination-up-to-date`
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(400)
    })
  })

  describe('POST species vaccinated up to date route', () => {
    let crumb
    const method = 'POST'

    beforeEach(async () => {
      crumb = await getCrumbs(global.__SERVER__)
    })

    test.each([
      { species: species.beef, speciesVaccinationUpToDate: 'no' },
      { species: species.dairy, speciesVaccinationUpToDate: 'no' },
      { species: species.beef, speciesVaccinationUpToDate: 'na' },
      { species: species.dairy, speciesVaccinationUpToDate: 'na' },
      { species: species.beef, speciesVaccinationUpToDate: 'yes' },
      { species: species.dairy, speciesVaccinationUpToDate: 'yes' }
    ])('returns 302 to next page when acceptable answer given', async ({ species, speciesVaccinationUpToDate }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species } })
      const url = `/vet/${species}-vaccination-up-to-date`
      const options = {
        method,
        url,
        payload: { crumb, speciesVaccinationUpToDate },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(`/vet/${species}-test`)
    })

    test.each([
      { species: species.beef, speciesVaccinationUpToDate: null },
      { species: species.dairy, speciesVaccinationUpToDate: null },
      { species: species.beef, speciesVaccinationUpToDate: undefined },
      { species: species.dairy, speciesVaccinationUpToDate: undefined },
      { species: species.beef, speciesVaccinationUpToDate: 'wrong' },
      { species: species.dairy, speciesVaccinationUpToDate: 'wrong' },
      { species: species.beef, speciesVaccinationUpToDate: '' },
      { species: species.dairy, speciesVaccinationUpToDate: '' }
    ])('returns error when unacceptable answer is given', async ({ species, speciesVaccinationUpToDate }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species } })
      const url = `/vet/${species}-vaccination-up-to-date`
      const options = {
        method,
        url,
        payload: { crumb, speciesVaccinationUpToDate },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      const $ = cheerio.load(res.payload)
      expect($('p.govuk-error-message').text()).toMatch('Select yes if breeding cattle are vaccinated')
      expect(res.statusCode).toBe(400)
    })

    test.each([
      { species: species.beef },
      { species: species.dairy }
    ])('when not logged in redirects to /vet', async ({ species }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species } })
      const url = `/vet/${species}-vaccination-up-to-date`
      const options = {
        method,
        url,
        payload: { crumb, speciesVaccinationUpToDate: 'no' },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet')
    })
  })
})
