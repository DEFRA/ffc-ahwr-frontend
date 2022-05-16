const { getApplication, getClaim } = require('../../../../../app/messaging/application')
const { applicationRequestQueue, applicationResponseQueue, fetchApplicationRequestMsgType, fetchClaimRequestMsgType } = require('../../../../../app/config')

jest.mock('../../../../../app/messaging')
const { receiveMessage, sendMessage } = require('../../../../../app/messaging')

describe('application messaging tests', () => {
  const sessionId = 'a-session-id'

  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('getApplication sends and receives message', async () => {
    const reference = 'VV-1234-5678'
    const receiveMessageRes = { id: 1 }
    receiveMessage.mockResolvedValue(receiveMessageRes)

    const message = await getApplication(reference, sessionId)

    expect(message).toEqual(receiveMessageRes)
    expect(receiveMessage).toHaveBeenCalledTimes(1)
    expect(receiveMessage).toHaveBeenCalledWith(sessionId, applicationResponseQueue)
    expect(sendMessage).toHaveBeenCalledTimes(1)
    expect(sendMessage).toHaveBeenCalledWith({ applicationReference: reference }, fetchApplicationRequestMsgType, applicationRequestQueue, { sessionId })
  })

  test('getClaim sends and receives message', async () => {
    const email = 'an@email.com'
    const receiveMessageRes = { id: 2 }
    receiveMessage.mockResolvedValue(receiveMessageRes)

    const message = await getClaim(email, sessionId)

    expect(message).toEqual(receiveMessageRes)
    expect(receiveMessage).toHaveBeenCalledTimes(1)
    expect(receiveMessage).toHaveBeenCalledWith(sessionId, applicationResponseQueue)
    expect(sendMessage).toHaveBeenCalledTimes(1)
    expect(sendMessage).toHaveBeenCalledWith({ email }, fetchClaimRequestMsgType, applicationRequestQueue, { sessionId })
  })
})
