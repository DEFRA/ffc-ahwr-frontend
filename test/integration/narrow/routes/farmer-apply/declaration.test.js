const cheerio = require('cheerio')

describe('Declaration test', () => {
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }
  const url = '/farmer-apply/declaration'

  test(`GET ${url} route returns 200`, async () => {
    const options = {
      method: 'GET',
      url,
      auth
    }
    const res = await global.__SERVER__.inject(options)
    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('h1.govuk-heading-l').text()).toEqual('Declaration')
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
