const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const getCrumbs = require('../../../../utils/get-crumbs')
const boom = require('@hapi/boom')

boom.internal = jest.fn()

const mockMessage = {
  sendMessage: () => {
    return 'nothing'
  },
  receiveMessage: jest.fn().mockReturnValueOnce({
    vetReference: 'VV-5874-0BFA'
  }).mockImplementationOnce(null)
}

const mockSession = {
  getVetVisitData: () => {
    return { signup: { reference: 'VV-0E69-B1CC' } }
  },
  setVetVisitData: () => {
    return { signup: { reference: 'VV-0E69-B1CC' } }
  }
}

jest.mock('../../../../../app/session', () => mockSession)
jest.mock('../../../../../app/messaging', () => mockMessage)

describe('Confirmation test', () => {
  const auth = { credentials: {}, strategy: 'cookie' }
  const url = '/vet/confirmation'

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
      expect($('h1').text()).toMatch('Record submitted')
      expect($('title').text()).toEqual('Confirmation')
      expectPhaseBanner.ok($)
    })

    test('returns 500', async () => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }
      const res = await global.__SERVER__.inject(options)
      expect(res.statusCode).toBe(500)
      expect(boom.internal).toHaveBeenCalledTimes(1)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toMatch('Sorry, there is a problem with the service')
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
})
