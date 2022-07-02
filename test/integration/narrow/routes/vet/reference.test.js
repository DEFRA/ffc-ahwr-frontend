const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const pageExpects = require('../../../../utils/page-expects')
const { reference: referenceErrorMessages } = require('../../../../../app/lib/error-messages')
const { vetSignup: { reference: referenceKey } } = require('../../../../../app/session/keys')
const { journeys: { vet: { title } } } = require('../../../../../app/config')

function expectPageContentOk ($) {
  expect($('.govuk-heading-l').text()).toEqual('Enter booking reference number')
  expect($('label[for=applicationReference]').text()).toMatch('Booking reference number')
  expect($('.govuk-button').text()).toMatch('Continue')
  expect($('title').text()).toEqual(`Enter booking reference number - ${title}`)
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
      const applicationReference = 'a-reference-number'
      const options = {
        method: 'GET',
        url
      }
      session.getVetSignup.mockReturnValue(applicationReference)

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expectPageContentOk($)
      expectPhaseBanner.ok($)
      expect($('#applicationReference').val()).toEqual(applicationReference)
    })
  })

  describe(`POST to ${url} route`, () => {
    test.each([
      { applicationReference: undefined, errorMessage: referenceErrorMessages.enterRef, expectedVal: undefined },
      { applicationReference: null, errorMessage: referenceErrorMessages.enterRef, expectedVal: undefined },
      { applicationReference: '', errorMessage: referenceErrorMessages.enterRef, expectedVal: undefined },
      { applicationReference: 'not-valid-ref', errorMessage: referenceErrorMessages.validRef, expectedVal: 'not-valid-ref' },
      { applicationReference: 'VV-1234-567G', errorMessage: referenceErrorMessages.validRef, expectedVal: 'VV-1234-567G' },
      { applicationReference: 'VV-1234-5678-more', errorMessage: referenceErrorMessages.validRef, expectedVal: 'VV-1234-5678-more' }
    ])('returns 400 when payload is invalid - %p', async ({ applicationReference, errorMessage, expectedVal }) => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        headers: { cookie: `crumb=${crumb}` },
        method: 'POST',
        payload: { crumb, applicationReference },
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      expectPageContentOk($)
      expectPhaseBanner.ok($)
      pageExpects.errors($, errorMessage)
      expect($('#applicationReference').val()).toEqual(expectedVal)
    })

    messaging.receiveMessage = jest.fn()
      .mockReturnValueOnce({ applicationReference: 'VV-1234-5678', applicationState: 'already_submitted', claimed: true })

    test('returns 404 when payload is valid', async () => {
      const applicationReference = 'VV-1234-5678'
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        headers: { cookie: `crumb=${crumb}` },
        method: 'POST',
        payload: { crumb, applicationReference },
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(404)
      const $ = cheerio.load(res.payload)
      expectPageContentOk($)
      expectPhaseBanner.ok($)
      pageExpects.errors($, `No application found for reference "${applicationReference}"`)
    })

    test.each([
      { applicationReference: 'VV-1234-5678' },
      { applicationReference: '  VV-1234-5678  ' }
    ])('returns 200 when payload is valid and stores in session (reference = $reference)', async ({ applicationReference }) => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        headers: { cookie: `crumb=${crumb}` },
        method: 'POST',
        payload: { crumb, applicationReference },
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet/rcvs')
      expect(session.setVetSignup).toHaveBeenCalledTimes(1)
      expect(session.setVetSignup).toHaveBeenCalledWith(res.request, referenceKey, applicationReference.trim())
    })
  })
})
