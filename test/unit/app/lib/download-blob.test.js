describe('Download blob tests', () => {
  let downloadBlob
  const container = 'container'
  const file = 'file'
  let blobServiceClientMock
  let storageBlobMock

  beforeAll(() => {
    jest.resetAllMocks()
    jest.resetModules()

    storageBlobMock = require('@azure/storage-blob')
    jest.mock('@azure/storage-blob', () => {
      return {
        BlobServiceClient: {
          fromConnectionString: jest.fn().mockImplementation(() => {
            return {
              getContainerClient: jest.fn().mockImplementation(() => {
                return {
                  exists: jest.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(false).mockResolvedValue(true),
                  getBlockBlobClient: jest.fn().mockImplementation(() => {
                    return {
                      downloadToBuffer: jest.fn().mockResolvedValue('contents of file')
                    }
                  })
                }
              })
            }
          })
        }
      }
    })
    blobServiceClientMock = storageBlobMock.BlobServiceClient

    downloadBlob = require('../../../../app/lib/download-blob')
  })

  test('creates client using connection string', async () => {
    await downloadBlob(container, file)

    expect(blobServiceClientMock.fromConnectionString).toHaveBeenCalledTimes(1)
  })
})
