const cheerio = require('cheerio')

const getCrumbs = require('../../../../utils/get-crumbs')

const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }

describe('Pigs test', () => {
  test('GET /farmer-apply/pigs route returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/farmer-apply/pigs',
      auth
    }
    const res = await global.__SERVER__.inject(options)
    expect(res.statusCode).toBe(200)
  })
  test('POST /farmer-apply/pigs route returns 302', async () => {
    const crumb = await getCrumbs(global.__SERVER__)
    const options = {
      method: 'POST',
      url: '/farmer-apply/pigs',
      payload: { crumb, pigs: 'yes' },
      auth,
      headers: { cookie: `crumb=${crumb}` }
    }
    const res = await global.__SERVER__.inject(options)
    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toEqual('/farmer-apply/check-answers')
  })
  test('POST /farmer-apply/pigs route returns Error', async () => {
    const crumb = await getCrumbs(global.__SERVER__)
    const options = {
      method: 'POST',
      url: '/farmer-apply/pigs',
      payload: { crumb, pigs: null },
      auth,
      headers: { cookie: `crumb=${crumb}` }
    }
    const res = await global.__SERVER__.inject(options)
    const $ = cheerio.load(res.payload)
    expect($('p.govuk-error-message').text()).toMatch('Select yes if you keep more than 50 pigs')
    expect(res.statusCode).toBe(200)
  })
})
