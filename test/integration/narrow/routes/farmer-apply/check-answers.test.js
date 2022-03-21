const cheerio = require('cheerio')

const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'basic' }
const varListTemplate = {
  cattle: 'yes',
  pig: 'yes',
  sheep: 'yes',
  cattleType: 'both'
}

let varList
const mockSession = {
  getApplication: (request, key) => {
    return varList
  }
}

jest.mock('../../../../../app/session', () => mockSession)
describe('Check Answers test', () => {
  beforeEach(() => {
    varList = { ...varListTemplate }
  })

  afterAll(() => {
    jest.resetAllMocks()
  })
  test('GET /farmer-apply/check-answers route returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/farmer-apply/check-answers',
      auth
    }
    const res = await global.__SERVER__.inject(options)
    expect(res.statusCode).toBe(200)
  })
  test('GET /farmer-apply/check-answers route returns 302', async () => {
    varList = {
      cattle: 'no',
      pig: 'no',
      sheep: 'no',
      cattleType: 'both'
    }
    const options = {
      method: 'GET',
      url: '/farmer-apply/check-answers',
      auth
    }
    const res = await global.__SERVER__.inject(options)
    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toEqual('/farmer-apply/not-eligible')
  })
  test('GET /farmer-apply/check-answers route returns 302', async () => {
    varList = {
      cattle: 'yes',
      pig: 'no',
      sheep: 'no',
      cattleType: 'both'
    }
    const options = {
      method: 'GET',
      url: '/farmer-apply/check-answers',
      auth
    }
    const res = await global.__SERVER__.inject(options)
    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-summary-list').text()).toContain('Beef and Dairy')
  })
})
