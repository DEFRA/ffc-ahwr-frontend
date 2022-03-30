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

describe('Vet, enter rcvs test', () => {
  const url = '/vet/rcvs'

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
      { rcvs: undefined, errorMessage: 'Enter the RCVS number' },
      { rcvs: null, errorMessage: 'Enter the RCVS number' },
      { rcvs: '', errorMessage: 'Enter the RCVS number' },
      { rcvs: 'not-valid-ref', errorMessage: 'Enter a valid RCVS number' },
      { rcvs: '123456A', errorMessage: 'Enter a valid RCVS number' }
    ])('returns 400 when payload is invalid - %p', async ({ rcvs, errorMessage }) => {
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
    })
  })
})
