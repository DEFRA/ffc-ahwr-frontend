describe('Healthz test', () => {
  let server
  const createServer = require('../../../../app/server')

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  test('GET /healthz route returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/healthz'
    }

    const res = await server.inject(options)

    expect(res.statusCode).toBe(200)
  })

  afterEach(async () => {
    await server.stop()
  })
})
