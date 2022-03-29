const cheerio = require('cheerio')

const varListTemplate = {
  cattle: 'yes',
  pigs: 'yes',
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

  test(`GET ${url} route returns 302 when there is no eligible livestock`, async () => {
    varList = {
      cattle: 'no',
      pigs: 'no',
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

  test.each([
    { cattleType: 'beef', text: 'Beef' },
    { cattleType: 'both', text: 'Beef and Dairy' },
    { cattleType: 'dairy', text: 'Dairy' }
  ])(`GET ${url} route shows beef and dairy option when cattleType is both - %p`, async ({ cattleType, text }) => {
    varList = {
      cattle: 'yes',
      pigs: 'no',
      sheep: 'no',
      cattleType
    }
    const options = {
      method: 'GET',
      url,
      auth
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-summary-list__row').length).toEqual(2)
    expect($('.govuk-summary-list__key').eq(0).text()).toMatch('Livestock')
    expect($('.govuk-summary-list__value').eq(0).text()).toMatch('More than 10 cattle')
    expect($('.govuk-summary-list__key').eq(1).text()).toMatch('Cattle type')
    expect($('.govuk-summary-list__value').eq(1).text()).toMatch(text)
  })

  test(`GET ${url} route does not show beef and dairy option when cattle is not selected is both`, async () => {
    varList = {
      cattle: 'no',
      pigs: 'yes',
      sheep: 'yes',
      cattleType: ''
    }
    const options = {
      method: 'GET',
      url,
      auth
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('.govuk-summary-list__row').length).toEqual(1)
    expect($('.govuk-summary-list__key').eq(0).text()).toMatch('Livestock')
    expect($('.govuk-summary-list__value').eq(0).text()).toMatch('More than 50 pigs')
    expect($('.govuk-summary-list__value').eq(0).text()).toMatch('More than 20 sheep')
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
