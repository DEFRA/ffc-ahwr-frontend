const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const pageExpects = require('../../../../utils/page-expects')
const { practice: practiceErrorMessages } = require('../../../../../app/lib/error-messages')
const { vetSignup: { practice: practiceKey } } = require('../../../../../app/session/keys')

function expectPageContentOk ($) {
  expect($('.govuk-heading-l').text()).toEqual('What is the name of the vet practice the vet was working for at the time of the review?')
  expect($('label[for=practice]').text()).toMatch('Vet practice name')
  expect($('.govuk-button').text()).toMatch('Continue')
  expect($('title').text()).toEqual('What is the name of vet practice')
  const backLink = $('.govuk-back-link')
  expect(backLink.text()).toMatch('Back')
  expect(backLink.attr('href')).toMatch('/vet/name')
}

const session = require('../../../../../app/session')
jest.mock('../../../../../app/session')

describe('Vet, enter practice name test', () => {
  const url = '/vet/practice'

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

    test('loads practice name if in session', async () => {
      const practiceName = 'practice name'
      const options = {
        method: 'GET',
        url
      }
      session.getVetSignup.mockReturnValue(practiceName)

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expectPageContentOk($)
      expectPhaseBanner.ok($)
      expect($('#practice').val()).toEqual(practiceName)
    })
  })

  describe(`POST to ${url} route`, () => {
    test.each([
      { practice: undefined, errorMessage: practiceErrorMessages.enterName, expectedVal: undefined },
      { practice: null, errorMessage: practiceErrorMessages.enterName, expectedVal: undefined },
      { practice: '', errorMessage: practiceErrorMessages.enterName, expectedVal: undefined },
      { practice: 'a'.repeat(101), errorMessage: practiceErrorMessages.nameLength, expectedVal: 'a'.repeat(101) }
    ])('returns 400 when payload is invalid - %p', async ({ practice, errorMessage, expectedVal }) => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        headers: { cookie: `crumb=${crumb}` },
        method: 'POST',
        payload: { crumb, practice },
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      expectPageContentOk($)
      expectPhaseBanner.ok($)
      pageExpects.errors($, errorMessage)
      expect($('#practice').val()).toEqual(expectedVal)
    })

    test.each([
      { practice: 'a' },
      { practice: 'a'.repeat(100) },
      { practice: `  ${'a'.repeat(100)}  ` }
    ])('returns 200 when payload is valid and stores in session (practice = $practice)', async ({ practice }) => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        headers: { cookie: `crumb=${crumb}` },
        method: 'POST',
        payload: { crumb, practice },
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet/email')
      expect(session.setVetSignup).toHaveBeenCalledTimes(1)
      expect(session.setVetSignup).toHaveBeenCalledWith(res.request, practiceKey, practice.trim())
    })
  })
})
