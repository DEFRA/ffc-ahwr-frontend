
beforeEach(async () => {
  // Set reference to server in order to close the server during teardown.
  const createServer = require('../app/server')
  jest.setTimeout(10000)
  const server = await createServer()
  await server.initialize()
  global.__SERVER__ = server
  global.__VALIDSESSION__ = true
})
const getCrumbs = require('../test/utils/get-crumbs')
describe('Login test', () => {
  test('POST to /login route with valid payload redirects to /farmer-apply/org-review', async () => {
    const crumb = await getCrumbs(global.__SERVER__)
    const reference = '1111'
    const options = {
      method: 'POST',
      url: '/login',
      payload: { crumb, reference, sbi: '111111111' },
      headers: { cookie: `crumb=${crumb}` }
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toEqual('farmer-apply/org-review')
    global.__AUTHCOOKIE__ = ''
    res.headers['set-cookie'].forEach(i => {
      global.__AUTHCOOKIE__ = `${i.split(';')[0]};`
    })
  })
})
