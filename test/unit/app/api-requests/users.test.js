const { storage: { connectionString, usersContainer, usersFile } } = require('../../../../app/config')

describe('Get users', () => {
  let downloadBlobMock
  let getByEmail

  beforeEach(() => {
    jest.resetAllMocks()
    jest.resetModules()

    downloadBlobMock = require('../../../../app/lib/download-blob')
    jest.mock('../../../../app/lib/download-blob')

    const users = require('../../../../app/api-requests/users')
    getByEmail = users.getByEmail
  })

  test('makes request to download users blob', async () => {
    await getByEmail('email')

    expect(downloadBlobMock).toHaveBeenCalledTimes(1)
    expect(downloadBlobMock).toHaveBeenCalledWith(connectionString, usersContainer, usersFile)
  })

  test.each([
    { fileContent: null },
    { fileContent: undefined }
  ])('return undefined when blob content is $fileContent', async ({ fileContent }) => {
    downloadBlobMock.mockResolvedValue(fileContent)

    const res = await getByEmail('email')

    expect(res).toEqual(undefined)
  })

  test('return undefined when email doesn\'t match any users', async () => {
    const fileContent = '[{ "email": "a@b.com" }]'
    downloadBlobMock.mockResolvedValue(fileContent)

    const res = await getByEmail('miss@email.com')

    expect(res).toEqual(undefined)
  })

  test('return user data when email is matched', async () => {
    const email = 'hit@email.com'
    const fileContent = `[{ "email": "${email}" }]`
    downloadBlobMock.mockResolvedValue(fileContent)

    const res = await getByEmail(email)

    expect(res).toEqual(JSON.parse(fileContent)[0])
  })

  test('return user data when email is matched but has different casing', async () => {
    const email = 'hit@email.com'
    const fileContent = `[{ "email": "${email}" }]`
    downloadBlobMock.mockResolvedValue(fileContent)

    const res = await getByEmail(email.toUpperCase())

    expect(res).toEqual(JSON.parse(fileContent)[0])
  })
})
