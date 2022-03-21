const cheerio = require('cheerio')

const getCrumbs = require('../../../../utils/get-crumbs')

const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'basic' }

jest.mock('../../../../../app/lib/send-email', () => () => {
  return jest.fn().mockReturnValueOnce(true)
})

const mockSession = {
  getOrganisation: (request) => {
    return 'dummy-org'
  }
}

jest.mock('../../../../../app/session', () => mockSession)

describe('Confirmation test', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })
  test('POST /farmer-apply/confirmation route returns 200', async () => {
    const crumb = await getCrumbs(global.__SERVER__)
    const options = {
      method: 'POST',
      url: '/farmer-apply/confirmation',
      payload: { crumb },
      auth,
      headers: { cookie: `crumb=${crumb}` }
    }
    const res = await global.__SERVER__.inject(options)
    expect(res.statusCode).toBe(200)
    const $ = cheerio.load(res.payload)
    expect($('h1').text()).toMatch('Application complete')
  })
})
