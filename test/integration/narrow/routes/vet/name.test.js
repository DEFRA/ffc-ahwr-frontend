const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const pageExpects = require('../../../../utils/page-expects')

function expectPageContentOk ($) {
  expect($('.govuk-heading-l').text()).toEqual('Enter the name of the vet who undertook the visit')
  expect($('label[for=name]').text()).toMatch('Name of the vet')
  expect($('.govuk-button').text()).toMatch('Continue')
  const backLink = $('.govuk-back-link')
  expect(backLink.text()).toMatch('Back')
  expect(backLink.attr('href')).toMatch('/vet/rcvs')
}

const session = require('../../../../../app/session')
jest.mock('../../../../../app/session')

describe('Vet, enter name test', () => {
  const url = '/vet/name'

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
      { name: undefined, errorMessage: 'Enter the name of the vet', expectedVal: undefined },
      { name: null, errorMessage: 'Enter the name of the vet', expectedVal: undefined },
      { name: '', errorMessage: 'Enter the name of the vet', expectedVal: undefined },
      { name: 'a'.repeat(101), errorMessage: 'Name must be 100 characters or fewer', expectedVal: 'a'.repeat(101) }
    ])('returns 400 when payload is invalid - %p', async ({ name, errorMessage, expectedVal }) => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        headers: { cookie: `crumb=${crumb}` },
        method: 'POST',
        payload: { crumb, name },
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(400)
      const $ = cheerio.load(res.payload)
      expectPageContentOk($)
      expectPhaseBanner.ok($)
      pageExpects.errors($, errorMessage)
      expect($('#name').val()).toEqual(expectedVal)
    })

    test.each([
      { name: 'a' },
      { name: 'a'.repeat(100) }
    ])('returns 200 when payload is valid and stores in session', async ({ name }) => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        headers: { cookie: `crumb=${crumb}` },
        method: 'POST',
        payload: { crumb, name },
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet/practice')
      expect(session.setVetSignup).toHaveBeenCalledTimes(1)
      expect(session.setVetSignup).toHaveBeenCalledWith(res.request, 'name', name)
    })
  })
})
