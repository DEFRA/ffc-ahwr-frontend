const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const { applicationRequestMsgType, applicationRequestQueue } = require('../../../../../app/config')

const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }

const sessionMock = require('../../../../../app/session')
jest.mock('../../../../../app/session')
const messagingMock = require('../../../../../app/messaging')
jest.mock('../../../../../app/messaging')

const application = { whichReview: 'pigs' }
const organisation = { id: 'organisation' }
sessionMock.getOrganisation.mockReturnValue(organisation)
sessionMock.getFarmerApplyData.mockReturnValue(application)

describe('Confirmation test', () => {
  const url = '/farmer-apply/confirmation'

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe(`POST ${url} route`, () => {
    test('returns 200, caches data and sends message', async () => {
      messagingMock.receiveMessage.mockResolvedValueOnce({ applicationReference: 'abc123' })
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
      expect($('h1').text()).toMatch('Application successful')
      expect($('title').text()).toEqual('Application successful')
      expectPhaseBanner.ok($)
      expect(sessionMock.getOrganisation).toHaveBeenCalledTimes(1)
      expect(sessionMock.getOrganisation).toHaveBeenCalledWith(res.request)
      expect(sessionMock.setFarmerApplyData).toHaveBeenCalledTimes(1)
      expect(sessionMock.setFarmerApplyData).toHaveBeenNthCalledWith(1, res.request, 'organisation', organisation)
      expect(sessionMock.getFarmerApplyData).toHaveBeenCalledTimes(1)
      expect(sessionMock.getFarmerApplyData).toHaveBeenCalledWith(res.request)
      expect(messagingMock.sendMessage).toHaveBeenCalledTimes(1)
      expect(messagingMock.sendMessage).toHaveBeenCalledWith(application, applicationRequestMsgType, applicationRequestQueue, { sessionId: res.request.yar.id })
    })

    test('returns 500 when no message response', async () => {
      messagingMock.receiveMessage.mockResolvedValueOnce(null)
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
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toEqual('Sorry, there is a problem with the service')
    })

    test('when not logged in redirects to /farmer-apply/login', async () => {
      const crumb = await getCrumbs(global.__SERVER__)
      const options = {
        method: 'POST',
        url,
        payload: { crumb },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/farmer-apply/login')
    })
  })
})
