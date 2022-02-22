const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')

describe('4xx error pages', () => {
  let server
  const createServer = require('../../../../app/server')

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
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
    expectPhaseBanner.ok($)
  })

  afterEach(async () => {
    await server.stop()
  })
})
