describe('Download blob tests', () => {
  let blockBlobClientMock
  let downloadBlob
  const connectionString = 'connectionString'
  const container = 'container'
  const file = 'file'

  beforeEach(() => {
    jest.resetAllMocks()
    jest.resetModules()

    const storageBlobMock = require('@azure/storage-blob')
    jest.mock('@azure/storage-blob')
    blockBlobClientMock = storageBlobMock.BlockBlobClient

    downloadBlob = require('../../../../app/lib/download-blob')
  })

  test('creates client correctly', async () => {
    await downloadBlob(connectionString, container, file)

    expect(blockBlobClientMock).toHaveBeenCalledTimes(1)
    expect(blockBlobClientMock).toHaveBeenCalledWith(connectionString, container, file)
  })

  test('returns undefined if the client doesn\'t exist', async () => {
    blockBlobClientMock.prototype.exists.mockResolvedValue(false)

    const res = await downloadBlob(connectionString, container, file)

    expect(res).toBeUndefined()
  })

  test('returns blob content as string when client exists', async () => {
    const fileContent = 'contents of file'
    blockBlobClientMock.prototype.exists.mockResolvedValue(true)
    blockBlobClientMock.prototype.downloadToBuffer.mockResolvedValue(fileContent)

    const res = await downloadBlob(connectionString, container, file)

    expect(res).toEqual(fileContent)
  })

  test('returns undefined and logs error when download errors', async () => {
    const error = new Error('bust')
    const consoleSpy = jest.spyOn(console, 'error')
    blockBlobClientMock.prototype.exists.mockResolvedValue(true)
    blockBlobClientMock.prototype.downloadToBuffer.mockRejectedValue(error)

    const res = await downloadBlob(connectionString, container, file)

    expect(res).toBeUndefined()
    expect(consoleSpy).toHaveBeenCalledWith(error)
    consoleSpy.mockRestore()
  })
})
