const cheerio = require('cheerio')

const getCrumbs = require('../../../../utils/get-crumbs')

const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'basic' }

describe('Cattle Type test', () => {
  test('GET /farmer-apply/cattle-type route returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/farmer-apply/cattle-type',
      auth
    }
    const res = await global.__SERVER__.inject(options)
    expect(res.statusCode).toBe(200)
  })
  test('POST /farmer-apply/cattle-type route returns 302', async () => {
    const crumb = await getCrumbs(global.__SERVER__)
    const options = {
      method: 'POST',
      url: '/farmer-apply/cattle-type',
      payload: { crumb, 'cattle-type': 'beef' },
      auth,
      headers: { cookie: `crumb=${crumb}` }
    }
    const res = await global.__SERVER__.inject(options)
    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toEqual('/farmer-apply/sheep')
  })
  test('POST /farmer-apply/cattle-type route returns Error', async () => {
    const crumb = await getCrumbs(global.__SERVER__)
    const options = {
      method: 'POST',
      url: '/farmer-apply/cattle-type',
      payload: { crumb, 'cattle-type': 'xyz' },
      auth,
      headers: { cookie: `crumb=${crumb}` }
    }
    const res = await global.__SERVER__.inject(options)
    const $ = cheerio.load(res.payload)
    expect($('p.govuk-error-message').text()).toMatch('Select the type of cattle that you keep')
    expect(res.statusCode).toBe(200)
  })
})
