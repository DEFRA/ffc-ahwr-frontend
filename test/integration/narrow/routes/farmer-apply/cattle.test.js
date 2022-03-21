const cheerio = require('cheerio')

const getCrumbs = require('../../../../utils/get-crumbs')

const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'basic' }

describe('Cattle test', () => {
  test('GET /farmer-apply/cattle route returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/farmer-apply/cattle',
      auth
    }
    const res = await global.__SERVER__.inject(options)
    expect(res.statusCode).toBe(200)
  })
  test('POST /farmer-apply/cattle route returns 302', async () => {
    const crumb = await getCrumbs(global.__SERVER__)
    const options = {
      method: 'POST',
      url: '/farmer-apply/cattle',
      payload: { crumb, cattle: 'yes' },
      auth,
      headers: { cookie: `crumb=${crumb}` }
    }
    const res = await global.__SERVER__.inject(options)
    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toEqual('/farmer-apply/cattle-type')
  })
  test('POST /farmer-apply/cattle redirects to sheep when no cattle selected', async () => {
    const crumb = await getCrumbs(global.__SERVER__)
    const options = {
      method: 'POST',
      url: '/farmer-apply/cattle',
      payload: { crumb, cattle: 'no' },
      auth,
      headers: { cookie: `crumb=${crumb}` }
    }
    const res = await global.__SERVER__.inject(options)
    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toEqual('/farmer-apply/sheep')
  })
  test('POST /farmer-apply/cattle route returns Error', async () => {
    const crumb = await getCrumbs(global.__SERVER__)
    const options = {
      method: 'POST',
      url: '/farmer-apply/cattle',
      payload: { crumb, cattle: null },
      auth,
      headers: { cookie: `crumb=${crumb}` }
    }
    const res = await global.__SERVER__.inject(options)
    const $ = cheerio.load(res.payload)
    expect($('p.govuk-error-message').text()).toMatch('Select yes if you keep more than 10 cattle')
    expect(res.statusCode).toBe(200)
  })
})
