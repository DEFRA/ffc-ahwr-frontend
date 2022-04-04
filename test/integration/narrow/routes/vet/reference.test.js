const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const pageExpects = require('../../../../utils/page-expects')
const { reference: referenceErrorMessages } = require('../../../../../app/lib/error-messages')
const { vetSignup: { reference: referenceKey } } = require('../../../../../app/session/keys')

function expectPageContentOk ($) {
  expect($('.govuk-heading-l').text()).toEqual('Enter the funding application reference number')
  expect($('label[for=reference]').text()).toMatch('Reference number')
  expect($('.govuk-button').text()).toMatch('Continue')
  expect($('title').text()).toEqual('Enter application reference number')
  const backLink = $('.govuk-back-link')
  expect(backLink.text()).toMatch('Back')
  expect(backLink.attr('href')).toMatch('/vet')
}

const session = require('../../../../../app/session')
jest.mock('../../../../../app/session')

const messaging = require('../../../../../app/messaging')
jest.mock('../../../../../app/messaging')

describe('Vet, enter reference test', () => {
  const url = '/vet/reference'

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

    test('loads reference if in session', async () => {
      const reference = 'a-reference-number'
      const options = {
        method: 'GET',
        url
      }
      session.getVetSignup.mockReturnValue(reference)

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expectPageContentOk($)
      expectPhaseBanner.ok($)
      expect($('#reference').val()).toEqual(reference)
    })
  })

  describe(`POST to ${url} route`, () => {
    test.each([
      { reference: undefined, errorMessage: referenceErrorMessages.enterRef, expectedVal: undefined },
      { reference: null, errorMessage: referenceErrorMessages.enterRef, expectedVal: undefined },
      { reference: '', errorMessage: referenceErrorMessages.enterRef, expectedVal: undefined },
      { reference: 'not-valid-ref', errorMessage: referenceErrorMessages.validRef, expectedVal: 'not-valid-ref' },
      { reference: 'VV-1234-567G', errorMessage: referenceErrorMessages.validRef, expectedVal: 'VV-1234-567G' },
      { reference: 'VV-1234-5678-more', errorMessage: referenceErrorMessages.validRef, expectedVal: 'VV-1234-5678-more' }
    ])('returns 400 when payload is invalid - %p', async ({ reference, errorMessage, expectedVal }) => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        headers: { cookie: `crumb=${crumb}` },
        method: 'POST',
        payload: { crumb, reference },
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      expectPageContentOk($)
      expectPhaseBanner.ok($)
      pageExpects.errors($, errorMessage)
      expect($('#reference').val()).toEqual(expectedVal)
    })

    messaging.receiveMessage = jest.fn().mockReturnValueOnce(null).mockReturnValue({ applicationId: 'VV-1234-5678' })
    test('returns 404 when payload is valid', async () => {
      const reference = 'VV-1234-5678'
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        headers: { cookie: `crumb=${crumb}` },
        method: 'POST',
        payload: { crumb, reference },
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(404)
      const $ = cheerio.load(res.payload)
      expectPageContentOk($)
      expectPhaseBanner.ok($)
      pageExpects.errors($, `No application found for reference "${reference}"`)
    })

    test.each([
      { reference: 'VV-1234-5678' },
      { reference: '  VV-1234-5678  ' }
    ])('returns 200 when payload is valid and stores in session (reference = $reference)', async ({ reference }) => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        headers: { cookie: `crumb=${crumb}` },
        method: 'POST',
        payload: { crumb, reference },
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet/rcvs')
      expect(session.setVetSignup).toHaveBeenCalledTimes(1)
      expect(session.setVetSignup).toHaveBeenCalledWith(res.request, referenceKey, reference.trim())
    })
  })
})
