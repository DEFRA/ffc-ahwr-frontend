const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../utils/phase-banner-expect')

describe('Home page test', () => {
  let server
  const createServer = require('../../../../app/server')

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  test('GET / route returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/'
    }

    const res = await server.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-heading-l').text()).toEqual('Apply for a vet visit')
    expect($('.govuk-warning-text__text').text()).toMatch('This is not a real service and is for demonstration purposes only.')
    expectPhaseBanner.ok($)
  })

  afterEach(async () => {
    await server.stop()
  })
})
