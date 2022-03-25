const cheerio = require('cheerio')

const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }

describe('Declaration test', () => {
  test('GET /farmer-apply/declaration route returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/farmer-apply/declaration',
      auth
    }
    const res = await global.__SERVER__.inject(options)
    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('h1.govuk-heading-l').text()).toEqual('Declaration')
  })
})
