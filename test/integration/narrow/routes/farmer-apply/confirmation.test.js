const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')

const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }

const mockMessage = {
  sendMessage: () => {
    return 'nothing'
  },
  receiveMessage: () => {
    return {
      applicationId: 123123123
    }
  }
}

const mockSession = {
  getOrganisation: () => {
    return 'dummy-org'
  },
  setApplication: () => {
    return 'dummy-app'
  },
  getApplication: () => {
    return 'dummy-app'
  }
}

jest.mock('../../../../../app/session', () => mockSession)
jest.mock('../../../../../app/messaging', () => mockMessage)
describe('Confirmation test', () => {
  const url = '/farmer-apply/confirmation'

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe(`POST ${url} route`, () => {
    test('returns 200', async () => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toMatch('Application complete')
      expect($('title').text()).toEqual('Confirmation')
      expectPhaseBanner.ok($)
    })

    test('when not logged in redirects to /farmer-apply/login with last page as next param', async () => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(`/farmer-apply/login?next=${encodeURIComponent(url)}`)
    })
  })
})
