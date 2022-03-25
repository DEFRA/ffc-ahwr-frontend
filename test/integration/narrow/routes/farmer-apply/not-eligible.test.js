const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')

describe('Not eligible page test', () => {
  const url = '/farmer-apply/not-eligible'

  test(`GET ${url} route when logged in returns 200`, async () => {
    const options = {
      auth: { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' },
      method: 'GET',
      url
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual('You are not eligible to apply')
    expectPhaseBanner.ok($)
  })

  test(`GET ${url} route when not logged in redirects to /login with last page as next param`, async () => {
    const options = {
      method: 'GET',
      url
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toEqual(`/login?next=${encodeURIComponent(url)}`)
  })
})