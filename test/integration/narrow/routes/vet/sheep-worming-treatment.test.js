const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const sheepWormTreatmentOptions = require('../../../../../app/constants/sheep-worming-treament-options')
const session = require('../../../../../app/session')
jest.mock('../../../../../app/session')

describe('Sheep worming treatment test', () => {
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }
  const url = '/vet/sheep-worming-treatment'

  describe(`GET ${url} route`, () => {
    test('returns 200', async () => {
      const options = {
        method: 'GET',
        url,
        auth
      }
      session.getVetVisitData.mockReturnValueOnce({ data: { sheepWormTreatment: sheepWormTreatmentOptions.bz.value } })

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toMatch('What was the active chemical in the worming treatment used?')
      expectPhaseBanner.ok($)
    })

    test('when not logged in redirects to /vet', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet')
    })
  })

  describe(`POST ${url} route`, () => {
    let crumb
    const method = 'POST'

    beforeEach(async () => {
      crumb = await getCrumbs(global.__SERVER__)
    })

    const redirectUrl = '/vet/sheep-test'

    test.each([
      { sheepWormTreatment: sheepWormTreatmentOptions.bz.value, redirectUrl },
      { sheepWormTreatment: sheepWormTreatmentOptions.lv.value, redirectUrl },
      { sheepWormTreatment: sheepWormTreatmentOptions.ml.value, redirectUrl },
      { sheepWormTreatment: sheepWormTreatmentOptions.ad.value, redirectUrl },
      { sheepWormTreatment: sheepWormTreatmentOptions.si.value, redirectUrl }
    ])('returns 302 to next page when acceptable answer given', async ({ sheepWormTreatment, redirectUrl }) => {
      const options = {
        method,
        url,
        payload: { crumb, sheepWormTreatment },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(redirectUrl)
    })

    test.each([
      { sheepWormTreatment: 'invalid value' }
    ])('returns error when unacceptable answer is given', async ({ sheepWormTreatment }) => {
      const options = {
        method,
        url,
        payload: { crumb, sheepWormTreatment },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }
      const res = await global.__SERVER__.inject(options)
      const $ = cheerio.load(res.payload)
      expect($('p.govuk-error-message').text()).toMatch('Select the active chemical')
      expect(res.statusCode).toBe(400)
    })

    test('when not logged in redirects to /vet', async () => {
      const options = {
        method,
        url,
        payload: { crumb, sheepWormTreatment: sheepWormTreatmentOptions.bz.value },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet')
    })
  })
})
