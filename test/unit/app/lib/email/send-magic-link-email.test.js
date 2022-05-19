const sendMagicLinkEmail = require('../../../../../app/lib/email/send-magic-link-email')
const notifyClient = require('../../../../../app/lib/email/notify-client')

notifyClient.sendEmail = jest.fn().mockResolvedValueOnce(true)
const validEmail = 'test@unit-test.com'
const cacheData = { }
const config = require('../../../../../app/config')
jest.mock('../../../../../app/config')
const users = require('../../../../../app/api-requests/users')
jest.mock('../../../../../app/api-requests/users')
const sendEmail = require('../../../../../app/lib/email/send-email')
jest.mock('../../../../../app/lib/email/send-email')
sendEmail.mockResolvedValue(true)
const testToken = '644a2a30-7487-4e98-a908-b5ecd82d5225'
config.testToken = testToken
users.getByEmail.mockResolvedValue({ email: validEmail, isTest: 'yes' })
const requestGetMock = {
  server:
      {
        app:
          {
            magiclinkCache: {
              get: (_email) => {
                return cacheData[_email]
              },
              set: (_email, _tokens) => {
                cacheData[_email] = _tokens
              }
            }
          }
      }
}
describe('Send Magic Link test', () => {
  test.each([
    { email: validEmail, token: testToken, data: {} },
    { email: validEmail, token: null, data: {} }
  ])('Returns success on call sendVetMagicLinkEmail', async ({ email, data, token }) => {
    const response = await sendMagicLinkEmail.sendVetMagicLinkEmail(requestGetMock, email, data)
    expect(response).toBeTruthy()
    if (token) {
      expect(cacheData[token]).not.toBeNull()
    } else {
      expect(cacheData[email]).not.toBeNull()
    }
  })
  test.each([
    { email: validEmail, testToken },
    { email: validEmail, testToken: null }
  ])('Returns success on call sendFarmerApplyLoginMagicLink', async ({ email, token }) => {
    const response = await sendMagicLinkEmail.sendFarmerApplyLoginMagicLink(requestGetMock, email)
    expect(response).toBeTruthy()
    if (token) {
      expect(cacheData[token]).not.toBeNull()
    } else {
      expect(cacheData[email]).not.toBeNull()
    }
  })
  test.each([
    { email: validEmail, testToken },
    { email: validEmail, testToken: null }
  ])('Returns success on call sendFarmerClaimLoginMagicLink', async ({ email, token }) => {
    const response = await sendMagicLinkEmail.sendFarmerClaimLoginMagicLink(requestGetMock, email)
    expect(response).toBeTruthy()
    if (token) {
      expect(cacheData[token]).not.toBeNull()
    } else {
      expect(cacheData[email]).not.toBeNull()
    }
  })
})
