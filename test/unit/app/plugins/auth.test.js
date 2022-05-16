const { v4: uuid } = require('uuid')
const { farmerApply } = require('../../../../app/config/user-types')
const { cookie: { ttl } } = require('../../../../app/config')

describe('Auth plugin test', () => {
  let getByEmail
  let session
  const org = { name: 'my-org' }

  beforeAll(async () => {
    jest.resetAllMocks()

    session = require('../../../../app/session')
    jest.mock('../../../../app/session')
    const orgs = require('../../../../app/api-requests/users')
    getByEmail = orgs.getByEmail
    jest.mock('../../../../app/api-requests/users')
  })

  const url = '/farmer-apply/login'
  const validEmail = 'dairy@ltd.com'
  const redirectTo = '/farmer-apply/org-review'

  describe('GET requests to /farmer-apply/login', () => {
    async function login () {
      const email = uuid() + validEmail
      const token = uuid()
      const options = {
        method: 'GET',
        url: `/verify-login?email=${email}&token=${token}`
      }

      await global.__SERVER__.app.magiclinkCache.set(email, [token])
      await global.__SERVER__.app.magiclinkCache.set(token, { email, redirectTo, userType: farmerApply })

      return global.__SERVER__.inject(options)
    }

    test('when logged in with nothing in session loads data into session and then uses that session data', async () => {
      const loginResponse = await login()

      const cookieHeaders = loginResponse.headers['set-cookie'].map(x => x.split('; ')[0]).join('; ')

      const options = {
        method: 'GET',
        url,
        headers: { cookie: cookieHeaders }
      }
      getByEmail.mockResolvedValue(org)

      const res = await global.__SERVER__.inject(options)
      const cookieHeader = res.headers['set-cookie']
      console.log(cookieHeader)
      console.log(cookieHeader[0])
      console.log(cookieHeader[0].split('; '))

      const maxAgeOfCookieInSeconds = cookieHeader[0].split('; ').filter(x => x.split('=')[0] === 'Max-Age')[0].split('=')[1]

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual(redirectTo)
      expect(session.setOrganisation).toHaveBeenCalledTimes(1)
      expect(session.setOrganisation).toHaveBeenCalledWith(res.request, 'name', org.name)
      expect(parseInt(maxAgeOfCookieInSeconds, 10) * 1000).toEqual(ttl)

      const resTwo = await global.__SERVER__.inject(options)

      expect(resTwo.statusCode).toBe(302)
      expect(resTwo.headers.location).toEqual('/farmer-apply/org-review')
    })
  })
})
