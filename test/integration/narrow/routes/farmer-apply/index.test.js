const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')

describe('Farmer apply home page test', () => {
  test('GET /farmer-apply route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: '/farmer-apply'
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual('Apply for an annual health and welfare review')
    const button = $('.govuk-main-wrapper .govuk-button')
    expect(button.attr('href')).toMatch('/farmer-apply/login')
    expect(button.text()).toMatch('Start now')
    expect($('title').text()).toEqual('Apply for an annual health and welfare review')
    expectPhaseBanner.ok($)
  })
})
