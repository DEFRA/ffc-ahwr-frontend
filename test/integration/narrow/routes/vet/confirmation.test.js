const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const getCrumbs = require('../../../../utils/get-crumbs')

const reference = 'VV-5874-0BFA'

const messagingMock = require('../../../../../app/messaging')
jest.mock('../../../../../app/messaging')

const mockSession = {
  getVetVisitData: () => {
    return { signup: { reference } }
  },
  setVetVisitData: () => {
    return { signup: { reference } }
  },
  setVetSignup: () => {
    return { signup: { reference } }
  },
  getVetSignup: () => {
    return { reference, applicationState: 'submitted' }
  }
}
jest.mock('../../../../../app/session', () => mockSession)

describe('Confirmation test', () => {
  const auth = { credentials: {}, strategy: 'cookie' }
  const url = '/vet/confirmation'

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe(`POST ${url} route`, () => {
    test('returns 200', async () => {
      messagingMock.receiveMessage.mockResolvedValueOnce({
        applicationState: 'not_claimed'
      })
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
      expect($('h1').text()).toMatch('Record submitted')
      expect($('title').text()).toEqual('Confirmation')
      expectPhaseBanner.ok($)
    })

    test('returns error message', async () => {
      messagingMock.receiveMessage.mockResolvedValueOnce({
        applicationState: 'claimed'
      })
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
      expect($('h1').text()).toMatch(
        'Application reference number is no longer valid.'
      )
      expectPhaseBanner.ok($)
    })

    test('when not logged in redirects to /vet', async () => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet')
    })
  })

  describe(`GET ${url} route`, () => {
    test('returns 200 when not logged in', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expectPhaseBanner.ok($)
    })

    test('loads reference if in session', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expectPhaseBanner.ok($)
      expect($('.govuk-panel__body strong').text()).toEqual(reference)
    })
  })
})
