const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')

describe('Vet home page test', () => {
  test('GET /vet route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: '/vet'
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual('Record Animal Health and Welfare Review data')
    const button = $('.govuk-main-wrapper .govuk-button')
    expect(button.attr('href')).toMatch('/vet/reference')
    expect(button.text()).toMatch('Start now')
    expect($('title').text()).toEqual('Record Animal Health and Welfare Review data')
    expectPhaseBanner.ok($)
  })
})
