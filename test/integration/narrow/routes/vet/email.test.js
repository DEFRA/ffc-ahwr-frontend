const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const pageExpects = require('../../../../utils/page-expects')
const { email: emailErrorMessages } = require('../../../../../app/lib/error-messages')

function expectPageContentOk ($) {
  expect($('h1').text()).toMatch('Enter your email address')
  expect($('label[for=email]').text()).toMatch('Enter your email address')
  expect($('.govuk-button').text()).toMatch('Continue')
  expect($('title').text()).toEqual('Enter email of vet')
  const backLink = $('.govuk-back-link')
  expect(backLink.text()).toMatch('Back')
  expect(backLink.attr('href')).toMatch('/vet/practice')
}

const session = require('../../../../../app/session')
jest.mock('../../../../../app/session')

describe('Vet, enter email name test', () => {
  const url = '/vet/email'
  const validEmail = 'email@test.com'

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

    test('loads email if in session', async () => {
      const options = {
        method: 'GET',
        url
      }
      session.getVetSignup.mockReturnValue(validEmail)

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expectPageContentOk($)
      expectPhaseBanner.ok($)
      expect($('#email').val()).toEqual(validEmail)
    })
  })

  describe(`POST to ${url} route`, () => {
    test.each([
      { email: undefined, errorMessage: emailErrorMessages.enterEmail, expectedVal: undefined },
      { email: null, errorMessage: emailErrorMessages.enterEmail, expectedVal: undefined },
      { email: '', errorMessage: emailErrorMessages.enterEmail, expectedVal: undefined },
      { email: 'not-an-email', errorMessage: emailErrorMessages.validEmail, expectedVal: 'not-an-email' }
    ])('returns 400 when payload is invalid - %p', async ({ email, errorMessage, expectedVal }) => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        headers: { cookie: `crumb=${crumb}` },
        method: 'POST',
        payload: { crumb, email },
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      expectPageContentOk($)
      expectPhaseBanner.ok($)
      pageExpects.errors($, errorMessage)
      expect($('#email').val()).toEqual(expectedVal)
    })

    test('returns 200 when payload is valid and stores in session', async () => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        headers: { cookie: `crumb=${crumb}` },
        method: 'POST',
        payload: { crumb, email: validEmail },
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet/check-email')
      expect(session.setVetSignup).toHaveBeenCalledTimes(1)
      expect(session.setVetSignup).toHaveBeenCalledWith(res.request, 'email', validEmail)
    })
  })
})
