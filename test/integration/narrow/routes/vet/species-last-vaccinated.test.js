const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const species = require('../../../../../app/constants/species')
const { journeys: { vet: { title } } } = require('../../../../../app/config')

const session = require('../../../../../app/session')
jest.mock('../../../../../app/session')

describe('Vet species last vaccinated test', () => {
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }

  describe('GET species last vaccinated route', () => {
    test.each([
      { species: species.beef },
      { species: species.dairy }
    ])('returns 200', async ({ species }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species } })
      const url = `/vet/${species}-last-vaccinated`
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toMatch('When was the herd last vaccinated for BVD?')
      expect($('title').text()).toEqual(`Last vaccination date - ${title}`)
      const backLink = $('.govuk-back-link')
      expect(backLink.text()).toMatch('Back')
      expect(backLink.attr('href')).toMatch(`/vet/${species}-vaccinated`)
      expectPhaseBanner.ok($)
    })

    test.each([
      { species: species.beef },
      { species: species.dairy }
    ])('when not logged in redirects to /vet', async ({ species }) => {
      const url = `/vet/${species}-last-vaccinated`
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
      const url = `/vet/${species}-last-vaccinated`
      const options = {
        method: 'GET',
        url,
        auth
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(400)
    })
  })

  describe('POST species last vaccinated route', () => {
    let crumb
    const method = 'POST'

    beforeEach(async () => {
      crumb = await getCrumbs(global.__SERVER__)
    })

    test.each([
      { species: species.beef, month: 7, year: 2021 },
      { species: species.dairy, month: 3, year: 2022 },
      { species: species.beef, month: 8, year: 2005 },
      { species: species.dairy, month: 3, year: 2022 },
      { species: species.beef, month: 11, year: 2005 },
      { species: species.dairy, month: 3, year: 2022 }
    ])('returns 302 to next page when acceptable answer given', async ({ species, month, year }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species } })
      const url = `/vet/${species}-last-vaccinated`
      const options = {
        method,
        url,
        payload: { crumb, month, year },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(`/vet/${species}-vaccination-up-to-date`)
    })

    test.each([
      { species: species.beef, month: null, year: null },
      { species: species.dairy, month: null, year: null },
      { species: species.beef, month: undefined, year: undefined },
      { species: species.dairy, month: undefined, year: undefined },
      { species: species.beef, month: 'wrong', year: 2400 },
      { species: species.dairy, month: 'wrong', year: 3000 },
      { species: species.beef, month: 'july', year: 1900 },
      { species: species.dairy, month: 'july', year: 1900 }
    ])('returns error when unacceptable answer is given', async ({ species, month, year }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species } })
      const url = `/vet/${species}-last-vaccinated`
      const options = {
        method,
        url,
        payload: { crumb, month, year },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      const $ = cheerio.load(res.payload)
      expect($('p.govuk-error-message').text()).toMatch('The date must be after January 2000 and before July 2022')
      expect(res.statusCode).toBe(400)
    })

    test.each([
      { species: species.beef },
      { species: species.dairy }
    ])('when not logged in redirects to /vet', async ({ species }) => {
      session.getVetVisitData.mockReturnValueOnce({ data: { whichReview: species } })
      const url = `/vet/${species}-last-vaccinated`
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
