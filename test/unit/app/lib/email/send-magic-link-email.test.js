
const config = require('../../../../../app/config')
jest.mock('../../../../../app/config')
const users = require('../../../../../app/api-requests/users')
jest.mock('../../../../../app/api-requests/users')
config.testToken = '1234567890'
const email = 'test@unit-test.com'
users.getByEmail.mockResolvedValue({ email: email, isTest: 'yes' })

const sendMagicLinkEmail = require('../../../../../app/lib/email/send-magic-link-email')

describe('Get Token test', () => {
  test('Returns valid test token', async () => {
    const response = await sendMagicLinkEmail.getToken(email)
    expect(response).toBe(config.testToken)
  })
  test('Returns invalid test token', async () => {
    users.getByEmail.mockResolvedValue({ email: email, isTest: '' })
    const response = await sendMagicLinkEmail.getToken(email)
    expect(response).not.toEqual(config.testToken)
  })
  test('Returns invalid test token when no test token', async () => {
    config.testToken = null
    const response = await sendMagicLinkEmail.getToken(email)
    expect(response).not.toEqual(config.testToken)
  })
})
