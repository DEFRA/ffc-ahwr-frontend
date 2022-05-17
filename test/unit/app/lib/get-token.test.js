
const config = require('../../../../app/config')
jest.mock('../../../../app/config')
const users = require('../../../../app/api-requests/users')
jest.mock('../../../../app/api-requests/users')
config.testToken = '644a2a30-7487-4e98-a908-b5ecd82d5225'
const email = 'test@unit-test.com'
users.getByEmail.mockResolvedValue({ email: email, isTest: 'yes' })

const getToken = require('../../../../app/lib/get-token')

describe('Get Token test', () => {
  test('Returns valid test token', async () => {
    const response = await getToken(email)
    expect(response).toBe(config.testToken)
  })
  test('Returns invalid test token', async () => {
    users.getByEmail.mockResolvedValue({ email: email, isTest: '' })
    const response = await getToken(email)
    expect(response).not.toEqual(config.testToken)
  })
  test.each([
    { testToken: config.testToken },
    { testToken: null }])('Returns test token as set', async ({ testToken }) => {
    config.testToken = testToken
    const response = await getToken(email)
    expect(response).not.toEqual(config.testToken)
  })
})
