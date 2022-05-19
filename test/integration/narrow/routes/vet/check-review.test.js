const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const pageExpects = require('../../../../utils/page-expects')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const species = require('../../../../../app/constants/species')
const { claim: { detailsCorrect } } = require('../../../../../app/session/keys')

const { getTypeOfReviewRowForDisplay } = require('../../../../../app/lib/visit-review-display-helpers')

function expectPageContentOk ($, vetVisitData) {
  const typeOfReviewRow = getTypeOfReviewRowForDisplay(vetVisitData.farmerApplication.data)
  expect($('.govuk-heading-l').text()).toEqual('Check the details of the review')
  const keys = $('.govuk-summary-list__key')
  const values = $('.govuk-summary-list__value')
  expect(keys.eq(0).text()).toMatch('Business name')
  expect(values.eq(0).text()).toMatch(vetVisitData.farmerApplication.data.organisation.name)
  expect(keys.eq(1).text()).toMatch(typeOfReviewRow.key.text)
  expect(values.eq(1).text()).toMatch(typeOfReviewRow.value.text)
  expect($('title').text()).toEqual('Check the details of the review')
  expectPhaseBanner.ok($)
}

describe('Vet check review page test', () => {
  let session
  const url = '/vet/check-review'
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }

  function setupSessionMock (speciesToTest) {
    let vvData
    let claimData
    switch (speciesToTest) {
      case species.beef:
        claimData = { cattleType: species.beef, cattle: 'yes' }
        vvData = { beef: 'yes', beefTest: 'yes', reviewReport: 'yes' }
        break
      case species.dairy:
        claimData = { cattleType: species.dairy, cattle: 'yes' }
        vvData = { dairy: 'yes', dairyTest: 'yes', reviewReport: 'no' }
        break
      case species.pigs:
        claimData = { pigs: 'yes' }
        vvData = { pigs: 'yes', pigsTest: 'no', reviewReport: 'yes' }
        break
      case species.sheep:
        claimData = { sheep: 'yes' }
        vvData = { sheep: 'yes', sheepTest: 100, reviewReport: 'no' }
        break
    }
    const vetVisitData = {
      farmerApplication: {
        data: {
          organisation: {
            name: 'org-name'
          },
          ...claimData
        }
      },
      ...vvData
    }
    session.getVetVisitData.mockReturnValue(vetVisitData)
    return vetVisitData
  }

  describe(`GET ${url} route when logged in`, () => {
    beforeAll(async () => {
      jest.resetAllMocks()

      session = require('../../../../../app/session')
      jest.mock('../../../../../app/session')
    })

    test.each([
      { speciesToTest: species.beef },
      { speciesToTest: species.dairy },
      { speciesToTest: species.pigs },
      { speciesToTest: species.sheep }
    ])('returns 200 for $speciesToTest', async ({ speciesToTest }) => {
      const vetVisitData = setupSessionMock(speciesToTest)
      const options = {
        auth,
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expectPageContentOk($, vetVisitData)
    })
  })

  describe(`GET ${url} route when not logged in`, () => {
    test('redirects to /vet', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet')
    })
  })

  describe(`POST requests to ${url} route when logged in`, () => {
    const method = 'POST'

    test.each([
      { crumb: '' },
      { crumb: undefined }
    ])('returns 403 when request does not contain crumb - $crumb', async ({ crumb }) => {
      const options = {
        auth,
        method,
        url,
        payload: { crumb },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(403)
      const $ = cheerio.load(res.payload)
      expectPhaseBanner.ok($)
      expect($('.govuk-heading-l').text()).toEqual('403 - Forbidden')
    })

    test('returns 400 with error message when no answer provided', async () => {
      const vetVisitData = setupSessionMock(species.pigs)
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        auth,
        method,
        url,
        payload: { crumb },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      expectPageContentOk($, vetVisitData)
      pageExpects.errors($, 'Select yes if the review details are correct')
    })

    test.each([
      { answer: 'no', redirect: '/vet/details-incorrect' },
      { answer: 'yes', redirect: '/vet/visit-date' }
    ])('redirects to correct page based on answer', async ({ answer, redirect }) => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        auth,
        method,
        url,
        payload: { crumb, [detailsCorrect]: answer },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(redirect)
    })

    test('redirects to /vet when not logged in', async () => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method,
        url,
        payload: { crumb },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet')
    })
  })
})
