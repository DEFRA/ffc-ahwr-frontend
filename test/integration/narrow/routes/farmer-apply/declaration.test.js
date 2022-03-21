const getCrumbs = require('../../../../utils/get-crumbs')

const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'basic' }

describe('Declaration test', () => {
  test('GET /farmer-apply/declaration route returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/farmer-apply/declaration',
      auth
    }
    const res = await global.__SERVER__.inject(options)
    expect(res.statusCode).toBe(200)
  })
  test('POST /farmer-apply/declaration route returns 302', async () => {
    const crumb = await getCrumbs(global.__SERVER__)
    const options = {
      method: 'POST',
      url: '/farmer-apply/declaration',
      payload: { crumb },
      auth,
      headers: { cookie: `crumb=${crumb}` }
    }
    const res = await global.__SERVER__.inject(options)
    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toEqual('/farmer-apply/confirmation')
  })
})
