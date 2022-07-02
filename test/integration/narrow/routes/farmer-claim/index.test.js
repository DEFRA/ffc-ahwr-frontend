const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const { journeys: { farmerClaim: { title } } } = require('../../../../../app/config')

describe('Farmer claim home page test', () => {
  test('GET /farmer-claim route returns 200 when not logged in', async () => {
    const options = {
      method: 'GET',
      url: '/farmer-claim'
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual('Claim funding for a livestock health and welfare review')
    const button = $('.govuk-main-wrapper .govuk-button')
    expect(button.attr('href')).toMatch('/farmer-claim/login')
    expect(button.text()).toMatch('Start now')
    expect($('title').text()).toEqual(`Claim funding - ${title}`)
    expectPhaseBanner.ok($)
  })
})
