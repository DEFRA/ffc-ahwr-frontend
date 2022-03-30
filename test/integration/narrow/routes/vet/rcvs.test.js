const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const pageExpects = require('../../../../utils/page-expects')

function expectPageContentOk ($) {
  expect($('.govuk-heading-l').text()).toEqual('Enter the RCVS number of the vet who undertook the visit')
  expect($('label[for=rcvs]').text()).toMatch('RCVS number')
  expect($('.govuk-button').text()).toMatch('Continue')
  const backLink = $('.govuk-back-link')
  expect(backLink.text()).toMatch('Back')
  expect(backLink.attr('href')).toMatch('/vet/reference')
}

const session = require('../../../../../app/session')
jest.mock('../../../../../app/session')

describe('Vet, enter rcvs test', () => {
  const url = '/vet/rcvs'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe(`GET ${url} route`, () => {
    test('returns 200 when not logged in', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expectPageContentOk($)
      expectPhaseBanner.ok($)
    })
  })

  describe(`POST to ${url} route`, () => {
    test.each([
      { rcvs: undefined, errorMessage: 'Enter the RCVS number', expectedVal: undefined },
      { rcvs: null, errorMessage: 'Enter the RCVS number', expectedVal: undefined },
      { rcvs: '', errorMessage: 'Enter the RCVS number', expectedVal: undefined },
      { rcvs: 'not-valid-ref', errorMessage: 'Enter a valid RCVS number', expectedVal: 'not-valid-ref' },
      { rcvs: '123456A', errorMessage: 'Enter a valid RCVS number', expectedVal: '123456A' }
    ])('returns 400 when payload is invalid - %p', async ({ rcvs, errorMessage, expectedVal }) => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        headers: { cookie: `crumb=${crumb}` },
        method: 'POST',
        payload: { crumb, rcvs },
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      expectPageContentOk($)
      expectPhaseBanner.ok($)
      pageExpects.errors($, errorMessage)
      expect($('#rcvs').val()).toEqual(expectedVal)
    })

    test.each([
      { rcvs: '1234567' },
      { rcvs: '123456X' }
    ])('returns 200 when payload is valid and stores in session', async ({ rcvs }) => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        headers: { cookie: `crumb=${crumb}` },
        method: 'POST',
        payload: { crumb, rcvs },
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet/name')
      expect(session.setVetSignup).toHaveBeenCalledTimes(1)
      expect(session.setVetSignup).toHaveBeenCalledWith(res.request, 'rcvs', rcvs)
    })
  })
})
