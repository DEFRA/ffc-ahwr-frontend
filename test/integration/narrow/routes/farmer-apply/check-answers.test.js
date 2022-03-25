const cheerio = require('cheerio')

const varListTemplate = {
  cattle: 'yes',
  pig: 'yes',
  sheep: 'yes',
  cattleType: 'both'
}

let varList
const mockSession = {
  getApplication: () => {
    return varList
  }
}

jest.mock('../../../../../app/session', () => mockSession)
describe('Check Answers test', () => {
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }
  const url = '/farmer-apply/check-answers'

  beforeEach(() => {
    varList = { ...varListTemplate }
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  test(`GET ${url} route returns 200`, async () => {
    const options = {
      method: 'GET',
      url,
      auth
    }
    const res = await global.__SERVER__.inject(options)
    expect(res.statusCode).toBe(200)
  })

  test(`GET ${url} route returns 302`, async () => {
    varList = {
      cattle: 'no',
      pig: 'no',
      sheep: 'no',
      cattleType: 'both'
    }
    const options = {
      method: 'GET',
      url,
      auth
    }
    const res = await global.__SERVER__.inject(options)
    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toEqual('/farmer-apply/not-eligible')
  })

  test(`GET ${url} route returns 302`, async () => {
    varList = {
      cattle: 'yes',
      pig: 'no',
      sheep: 'no',
      cattleType: 'both'
    }
    const options = {
      method: 'GET',
      url,
      auth
    }
    const res = await global.__SERVER__.inject(options)
    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-summary-list').text()).toContain('Beef and Dairy')
  })

  test(`GET ${url} route when not logged in redirects to /login with last page as next param`, async () => {
    const options = {
      method: 'GET',
      url
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toEqual(`/login?next=${encodeURIComponent(url)}`)
  })
})
