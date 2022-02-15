const cheerio = require('cheerio')

describe('4xx error pages', () => {
  let server
  const createServer = require('../../../../app/server')

  beforeEach(async () => {
    server = await createServer()
    await server.start()
  })

  test('GET /unknown route returns 404', async () => {
    const options = {
      method: 'GET',
      url: '/unknown'
    }

    const res = await server.inject(options)

    expect(res.statusCode).toBe(404)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual('404 - Not Found')
    expect($('.govuk-body').text()).toEqual('Not Found')
    expect($('.govuk-phase-banner').length).toEqual(1)
    expect($('.govuk-phase-banner').text()).toMatch('beta')
    expect($('.govuk-phase-banner').text()).toMatch('This is a new service - your feedback will help us to improve it.')
  })

  afterEach(async () => {
    await server.stop()
  })
})
