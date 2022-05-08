const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const amounts = require('../../../../../app/constants/amounts')

describe('Vet visit review page test', () => {
  let session
  const url = '/farmer-claim/visit-review'

  describe(`GET ${url} route when logged in`, () => {
    beforeAll(async () => {
      jest.resetAllMocks()

      session = require('../../../../../app/session')
      jest.mock('../../../../../app/session')
    })

    test('returns 200', async () => {
      const claimData = {
        data: {
          pigs: 'yes',
          organisation: {
            name: 'org-name'
          }
        },
        vetVisit: {
          data: {
            visitDate: new Date()
          }
        }
      }
      session.getClaim.mockReturnValue(claimData)
      const options = {
        auth: { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' },
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toEqual('Confirm the details of your livestock health and welfare review')
      const keys = $('.govuk-summary-list__key')
      const values = $('.govuk-summary-list__value')
      expect(keys.eq(0).text()).toMatch('Business name')
      expect(values.eq(0).text()).toMatch(claimData.data.organisation.name)
      expect(keys.eq(1).text()).toMatch('Date of review')
      expect(values.eq(1).text()).toMatch(new Date(claimData.vetVisit.data.visitDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }))
      expect(keys.eq(2).text()).toMatch('Payment amount')
      expect(values.eq(2).text()).toMatch(`£${amounts.pigs}`)
      expect($('title').text()).toEqual('Confirm the details of your livestock health and welfare review')
      expectPhaseBanner.ok($)
    })

    test('returns 404 when no farmer claim data is found', async () => {
      session.getClaim.mockReturnValue(undefined)
      const options = {
        auth: { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' },
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(404)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toEqual('404 - Not Found')
    })
  })

  describe(`GET ${url} route when not logged in`, () => {
    test('redirects to /farmer-claim/login', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/farmer-claim/login')
    })
  })
})
