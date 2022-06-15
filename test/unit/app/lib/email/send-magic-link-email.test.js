const sendMagicLinkEmail = require('../../../../../app/lib/email/send-magic-link-email')
const { notify: { templateIdFarmerApplyLogin, templateIdFarmerClaimLogin, templateIdVetLogin }, serviceUri } = require('../../../../../app/config')
const { farmerApply, farmerClaim, vet } = require('../../../../../app/constants/user-types')

const getToken = require('../../../../../app/lib/get-token')
jest.mock('../../../../../app/lib/get-token')

const sendEmail = require('../../../../../app/lib/email/send-email')
jest.mock('../../../../../app/lib/email/send-email')
let cacheData = { }
const requestGetMock = {
  server:
      {
        app:
          {
            magiclinkCache: {
              get: (key) => {
                return cacheData[key]
              },
              set: (key, value) => {
                cacheData[key] = value
              }
            }
          }
      }
}

describe('Send Magic Link test', () => {
  const email = 'test@unit-test.com'
  const sendEmailResponse = true
  const testToken = '644a2a30-7487-4e98-a908-b5ecd82d5225'

  beforeEach(() => {
    cacheData = {}
    jest.resetAllMocks()

    sendEmail.mockResolvedValue(sendEmailResponse)
  })

  test('sends email for vet login', async () => {
    const token = testToken
    getToken.mockResolvedValue(token)
    const data = {}

    const response = await sendMagicLinkEmail.sendVetMagicLinkEmail(requestGetMock, email, data)

    expect(response).toEqual(sendEmailResponse)
    expect(cacheData[email]).toEqual([token])
    expect(cacheData[token]).toEqual({ email, redirectTo: 'vet/check-review', userType: vet, data })
    expect(sendEmail).toHaveBeenCalledTimes(1)
    expect(sendEmail).toHaveBeenCalledWith(templateIdVetLogin, email, {
      personalisation: { magiclink: `${serviceUri}/verify-login?token=${token}&email=${email}` },
      reference: token
    })
  })

  test('sends email for farmer apply', async () => {
    const token = testToken
    getToken.mockResolvedValue(token)

    const response = await sendMagicLinkEmail.sendFarmerApplyLoginMagicLink(requestGetMock, email)

    expect(response).toEqual(sendEmailResponse)
    expect(cacheData[email]).toEqual([token])
    expect(cacheData[token]).toEqual({ email, redirectTo: 'farmer-apply/org-review', userType: farmerApply })
    expect(sendEmail).toHaveBeenCalledTimes(1)
    expect(sendEmail).toHaveBeenCalledWith(templateIdFarmerApplyLogin, email, {
      personalisation: { magiclink: `${serviceUri}/verify-login?token=${token}&email=${email}` },
      reference: token
    })
  })

  test('sends email for farmer claim', async () => {
    const token = testToken
    getToken.mockResolvedValue(token)

    const response = await sendMagicLinkEmail.sendFarmerClaimLoginMagicLink(requestGetMock, email)

    expect(response).toEqual(sendEmailResponse)
    expect(cacheData[email]).toEqual([token])
    expect(cacheData[token]).toEqual({ email, redirectTo: 'farmer-claim/visit-review', userType: farmerClaim })
    expect(sendEmail).toHaveBeenCalledTimes(1)
    expect(sendEmail).toHaveBeenCalledWith(templateIdFarmerClaimLogin, email, {
      personalisation: { magiclink: `${serviceUri}/verify-login?token=${token}&email=${email}` },
      reference: token
    })
  })
})
