const cheerio = require('cheerio')

const getCrumbs = require('../../../../utils/get-crumbs')

describe('Pigs test', () => {
  const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'cookie' }
  const url = '/farmer-apply/pigs'

  test(`GET ${url} route returns 200`, async () => {
    const options = {
      method: 'GET',
      url,
      auth
    }
    const res = await global.__SERVER__.inject(options)
    expect(res.statusCode).toBe(200)
  })

  test(`GET ${url} route when not logged in redirects to /login with last page as next param`, async () => {
    const options = {
      method: 'GET',
      url
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toEqual(`/login?next=${encodeURIComponent(url)}`)
  })

  test(`POST ${url} route returns 302`, async () => {
    const crumb = await getCrumbs(global.__SERVER__)
    const options = {
      method: 'POST',
      url,
      payload: { crumb, pigs: 'yes' },
      auth,
      headers: { cookie: `crumb=${crumb}` }
    }
    const res = await global.__SERVER__.inject(options)
    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toEqual('/farmer-apply/check-answers')
  })

  test(`POST ${url} route returns Error`, async () => {
    const crumb = await getCrumbs(global.__SERVER__)
    const options = {
      method: 'POST',
      url,
      payload: { crumb, pigs: null },
      auth,
      headers: { cookie: `crumb=${crumb}` }
    }
    const res = await global.__SERVER__.inject(options)
    const $ = cheerio.load(res.payload)
    expect($('p.govuk-error-message').text()).toMatch('Select yes if you keep more than 50 pigs')
    expect(res.statusCode).toBe(200)
  })

  test(`POST ${url} route when not logged in redirects to /login with last page as next param`, async () => {
    const crumb = await getCrumbs(global.__SERVER__)
    const options = {
      method: 'POST',
      url,
      payload: { crumb, pigs: 'no' },
      headers: { cookie: `crumb=${crumb}` }
    }

    const res = await global.__SERVER__.inject(options)

    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toEqual(`/login?next=${encodeURIComponent(url)}`)
  })
})
