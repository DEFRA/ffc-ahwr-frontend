const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')

describe('Org review page test', () => {
  let session
  const url = '/farmer-apply/org-review'

  describe(`GET ${url} route when logged in`, () => {
    beforeAll(async () => {
      jest.clearAllMocks()
      jest.resetModules()

      session = require('../../../../../app/session')
      jest.mock('../../../../../app/session')
    })

    test('returns 200', async () => {
      const org = {
        address: ' org-address-here',
        cph: '11/222/3333',
        email: 'org@test.com',
        name: 'org-name',
        sbi: '123456789'
      }
      session.getOrganisation.mockReturnValue(org)
      const options = {
        auth: { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' },
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toEqual('Health and welfare review funding for this organisation')
      expect($('.govuk-heading-m').text()).toEqual(org.name)
      const keys = $('.govuk-summary-list__key')
      const values = $('.govuk-summary-list__value')
      expect(keys.eq(0).text()).toMatch('SBI number')
      expect(values.eq(0).text()).toMatch(org.sbi)
      expect(keys.eq(1).text()).toMatch('CPH number')
      expect(values.eq(1).text()).toMatch(org.cph)
      expect(keys.eq(2).text()).toMatch('Address')
      expect(values.eq(2).text()).toMatch(org.address)
      expect(keys.eq(3).text()).toMatch('Contact email address')
      expect(values.eq(3).text()).toMatch(org.email)
      expectPhaseBanner.ok($)
    })

    test('returns 404 when no organisation is found', async () => {
      session.getOrganisation.mockReturnValue(undefined)
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
    test('redirects to /login with last page as next param', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(`/login?next=${encodeURIComponent(url)}`)
    })
  })
})
