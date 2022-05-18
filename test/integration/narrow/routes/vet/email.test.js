const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const pageExpects = require('../../../../utils/page-expects')
const { email: emailErrorMessages } = require('../../../../../app/lib/error-messages')
const { vetSignup: { email: emailKey } } = require('../../../../../app/session/keys')

function expectPageContentOk ($) {
  expect($('h1').text()).toMatch('What is the vet practice email address?')
  expect($('label[for=email]').text()).toMatch('Enter your email address')
  expect($('.govuk-button').text()).toMatch('Continue')
  expect($('title').text()).toEqual('Enter email of vet')
  const backLink = $('.govuk-back-link')
  expect(backLink.text()).toMatch('Back')
  expect(backLink.attr('href')).toMatch('/vet/practice')
}

const session = require('../../../../../app/session')
jest.mock('../../../../../app/session')
const sendMagicLinkEmail = require('../../../../../app/lib/email/send-magic-link-email')
jest.mock('../../../../../app/lib/email/send-magic-link-email')

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

    test.each([
      { email: validEmail },
      { email: `  ${validEmail}  ` }
    ])('returns 302 when payload is valid, sends email and stores email in session (email = "$email")', async ({ email }) => {
      const signupData = {}
      session.getVetSignup.mockReturnValueOnce(signupData)
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        headers: { cookie: `crumb=${crumb}` },
        method: 'POST',
        payload: { crumb, email },
        url
      }
      sendMagicLinkEmail.sendVetMagicLinkEmail.mockResolvedValue(true)

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet/check-email')
      expect(session.setVetSignup).toHaveBeenCalledTimes(1)
      expect(session.setVetSignup).toHaveBeenCalledWith(res.request, emailKey, email.trim())
      expect(sendMagicLinkEmail.sendVetMagicLinkEmail).toHaveBeenCalledTimes(1)
      expect(sendMagicLinkEmail.sendVetMagicLinkEmail).toHaveBeenCalledWith(res.request, email.trim(), signupData)
    })

    test('returns 500 when problem sending email', async () => {
      const signupData = {}
      session.getVetSignup.mockReturnValueOnce(signupData)
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        headers: { cookie: `crumb=${crumb}` },
        method: 'POST',
        payload: { crumb, email: validEmail },
        url
      }
      sendMagicLinkEmail.sendVetMagicLinkEmail.mockResolvedValue(false)

      const res = await global.__SERVER__.inject(options)

      expect(session.setVetSignup).toHaveBeenCalledTimes(1)
      expect(session.setVetSignup).toHaveBeenCalledWith(res.request, emailKey, validEmail)
      expect(sendMagicLinkEmail.sendVetMagicLinkEmail).toHaveBeenCalledTimes(1)
      expect(sendMagicLinkEmail.sendVetMagicLinkEmail).toHaveBeenCalledWith(res.request, validEmail, signupData)
      expect(res.statusCode).toBe(500)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toEqual('Sorry, there is a problem with the service')
    })
  })
})
