const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')

describe('Dairy Cattle on farm test', () => {
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }
  const url = '/vet/dairy-cattle-on-farm'

  describe(`GET ${url} route`, () => {
    test('returns 200', async () => {
      const options = {
        method: 'GET',
        url,
        auth
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expect($('h1').text()).toMatch('Were there more than 10 dairy cattle on the farm at the time of the review?')
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

    test.each([
      { dairyCattleOnFarm: 'no' },
      { dairyCattleOnFarm: 'yes' }
    ])('returns 302 to next page when acceptable answer given', async ({ dairyCattleOnFarm }) => {
      const options = {
        method,
        url,
        payload: { crumb, dairyCattleOnFarm },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet/declaration')
    })

    test.each([
      { dairyCattleOnFarm: null },
      { dairyCattleOnFarm: undefined },
      { dairyCattleOnFarm: 'wrong' },
      { dairyCattleOnFarm: '' }
    ])('returns error when unacceptable answer is given', async ({ dairyCattleOnFarm }) => {
      const options = {
        method,
        url,
        payload: { crumb, dairyCattleOnFarm },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      const $ = cheerio.load(res.payload)
      expect($('p.govuk-error-message').text()).toMatch('Select yes if there were more than 10 cattle in the herd')
      expect(res.statusCode).toBe(200)
    })

    test('when not logged in redirects to /vet', async () => {
      const options = {
        method,
        url,
        payload: { crumb, dairyCattleOnFarm: 'no' },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet')
    })
  })
})
