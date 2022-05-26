const cheerio = require('cheerio')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const getCrumbs = require('../../../../utils/get-crumbs')

describe('Org review page test', () => {
  let session
  const url = '/farmer-apply/org-review'
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }

  describe(`GET ${url} route when logged in`, () => {
    beforeAll(async () => {
      jest.resetAllMocks()

      session = require('../../../../../app/session')
      jest.mock('../../../../../app/session')
    })

    test('returns 200', async () => {
      const org = {
        farmerName: 'Dailry Farmer',
        address: ' org-address-here',
        cph: '11/222/3333',
        email: 'org@test.com',
        name: 'org-name',
        sbi: '123456789'
      }
      session.getFarmerApplyData.mockReturnValue(org)
      const options = {
        auth,
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('.govuk-heading-l').text()).toEqual('Check your details')
      const keys = $('.govuk-summary-list__key')
      const values = $('.govuk-summary-list__value')
      expect(keys.eq(0).text()).toMatch('Farmer name')
      expect(values.eq(0).text()).toMatch(org.farmerName)
      expect(keys.eq(1).text()).toMatch('Business name')
      expect(values.eq(1).text()).toMatch(org.name)
      expect(keys.eq(2).text()).toMatch('SBI number')
      expect(values.eq(2).text()).toMatch(org.sbi)
      expect(keys.eq(3).text()).toMatch('CPH number')
      expect(values.eq(3).text()).toMatch(org.cph)
      expect(keys.eq(4).text()).toMatch('Address')
      expect(values.eq(4).text()).toMatch(org.address)
      expect(keys.eq(5).text()).toMatch('Contact email address')
      expect(values.eq(5).text()).toMatch(org.email)
      expect($('title').text()).toEqual('Check your details')
      expect($('legend').text().trim()).toEqual('Are your details correct?')
      expect($('.govuk-radios__item').length).toEqual(2)
      expectPhaseBanner.ok($)
    })

    test('returns 404 when no organisation is found', async () => {
      session.getFarmerApplyData.mockReturnValue(undefined)
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
    test('redirects to /farmer-apply/login', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/farmer-apply/login')
    })
  })

  describe(`POST ${url} route`, () => {
    let crumb
    const method = 'POST'

    beforeEach(async () => {
      crumb = await getCrumbs(global.__SERVER__)
    })

    test.each([
      { confirmCheckDetails: 'yes' }
    ])('returns 302 to next page when acceptable answer given', async ({ confirmCheckDetails }) => {
      const options = {
        method,
        url,
        payload: { crumb, confirmCheckDetails },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/farmer-apply/which-review')
    })

    test.each([
      { confirmCheckDetails: null },
      { confirmCheckDetails: undefined },
      { confirmCheckDetails: 'wrong' },
      { confirmCheckDetails: '' },
      { confirmCheckDetails: 'no' }
    ])('returns error when unacceptable answer is given', async ({ confirmCheckDetails }) => {
      const org = {
        farmerName: 'Dailry Farmer',
        address: ' org-address-here',
        cph: '11/222/3333',
        email: 'org@test.com',
        name: 'org-name',
        sbi: '123456789'
      }
      session.getFarmerApplyData.mockReturnValue(org)
      const options = {
        method,
        url,
        payload: { crumb, confirmCheckDetails },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      const $ = cheerio.load(res.payload)
      expect($('p.govuk-error-message').text()).toMatch('Select yes and confirm your details')
      expect(res.statusCode).toBe(400)
    })
  })
})
