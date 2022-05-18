const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const pageExpects = require('../../../../utils/page-expects')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const amounts = require('../../../../../app/constants/amounts')
const { claim: { detailsCorrect } } = require('../../../../../app/session/keys')

function expectPageContentOk ($, claimData) {
  expect($('.govuk-heading-l').text()).toEqual('Confirm the details of your annual health and welfare review')
  const keys = $('.govuk-summary-list__key')
  const values = $('.govuk-summary-list__value')
  expect(keys.eq(0).text()).toMatch('Business name')
  expect(values.eq(0).text()).toMatch(claimData.data.organisation.name)
  expect(keys.eq(1).text()).toMatch('Date of review')
  expect(values.eq(1).text()).toMatch(new Date(claimData.vetVisit.data.visitDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }))
  expect(keys.eq(2).text()).toMatch('Vet name')
  expect(values.eq(2).text()).toMatch(claimData.vetVisit.data.signup.name)
  expect(keys.eq(3).text()).toMatch('Type of review')
  expect(values.eq(3).text()).toMatch('Pigs')
  expect(keys.eq(4).text()).toMatch('PIGS found')
  expect(values.eq(4).text()).toMatch('Answer from vet visit goes here')
  expect(keys.eq(5).text()).toMatch('Payment amount')
  expect(values.eq(5).text()).toMatch(`£${amounts.pigs}`)
  expect($('title').text()).toEqual('Confirm the details of your annual health and welfare review')
  expectPhaseBanner.ok($)
}

describe('Vet visit review page test', () => {
  let session
  const url = '/farmer-claim/visit-review'
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }

  function setupSessionMock () {
    const claimData = {
      data: {
        pigs: 'yes',
        organisation: {
          name: 'org-name'
        }
      },
      vetVisit: {
        data: {
          signup: {
            name: 'name of the vet'
          },
          visitDate: new Date()
        }
      }
    }
    session.getClaim.mockReturnValue(claimData)
    return claimData
  }

  describe(`GET ${url} route when logged in`, () => {
    beforeAll(async () => {
      jest.resetAllMocks()

      session = require('../../../../../app/session')
      jest.mock('../../../../../app/session')
    })

    test('returns 200', async () => {
      const claimData = setupSessionMock()
      const options = {
        auth,
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expectPageContentOk($, claimData)
    })

    test('returns 404 when no farmer claim data is found', async () => {
      session.getClaim.mockReturnValue(undefined)
      const options = {
        auth,
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(404)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toEqual('404 - Not Found')
    })
  })

  describe(`GET ${url} route when not logged in`, () => {
    test('redirects to /farmer-claim/login', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/farmer-claim/login')
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
      const claimData = setupSessionMock()
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
      expectPageContentOk($, claimData)
      pageExpects.errors($, 'Select yes if the review details are correct')
    })

    test.each([
      { answer: 'no', redirect: '/farmer-claim/details-incorrect' },
      { answer: 'yes', redirect: '/farmer-claim/submit-claim' }
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

    test('redirects to /farmer-claim/login when not logged in', async () => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method,
        url,
        payload: { crumb },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/farmer-claim/login')
    })
  })
})
