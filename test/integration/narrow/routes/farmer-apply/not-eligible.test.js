const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')

describe('Not eligible page test', () => {
  test('GET /farmer-apply/not-eligible route returns 200', async () => {
    const options = {
      auth: { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' },
      method: 'GET',
      url: '/farmer-apply/not-eligible'
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual('You are not eligible to apply')
    expectPhaseBanner.ok($)
  })
})
