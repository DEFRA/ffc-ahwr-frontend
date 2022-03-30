const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const pageExpects = require('../../../../utils/page-expects')

function expectPageContentOk ($) {
  expect($('.govuk-heading-l').text()).toEqual('Enter the funding application reference number')
  expect($('label[for=reference]').text()).toMatch('Reference number')
  expect($('.govuk-button').text()).toMatch('Continue')
  const backLink = $('.govuk-back-link')
  expect(backLink.text()).toMatch('Back')
  expect(backLink.attr('href')).toMatch('/vet')
}

describe('Vet, enter reference test', () => {
  const url = '/vet/reference'

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
      { reference: undefined, errorMessage: 'Enter the reference number', expectedVal: undefined },
      { reference: null, errorMessage: 'Enter the reference number', expectedVal: undefined },
      { reference: '', errorMessage: 'Enter the reference number', expectedVal: undefined },
      { reference: 'not-valid-ref', errorMessage: 'The reference number has the format begining "VV-" followed by two groups of four characters e.g. "VV-A2C4-EF78"', expectedVal: 'not-valid-ref' },
      { reference: 'VV-1234-567G', errorMessage: 'The reference number has the format begining "VV-" followed by two groups of four characters e.g. "VV-A2C4-EF78"', expectedVal: 'VV-1234-567G' }
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

    // TODO: remove skip when application lookup functionality plugged in
    test.skip('returns 404 when payload is valid', async () => {
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

    test('returns 200 when payload is valid and stores in session', async () => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        headers: { cookie: `crumb=${crumb}` },
        method: 'POST',
        payload: { crumb, reference: 'VV-1234-5678' },
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet/rcvs')
    })
  })
})
