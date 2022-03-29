const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')

describe('Vet, enter reference test', () => {
  const url = '/vet/enter-reference'

  test(`GET ${url} route returns 200 when not logged in`, async () => {
    const options = {
      method: 'GET',
      url
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual('Enter the funding application reference number')
    expect($('label[for=reference]').text()).toEqual('Reference number')
    expect($('.govuk-button').text()).toMatch('Continue')
    expectPhaseBanner.ok($)
  })
})
