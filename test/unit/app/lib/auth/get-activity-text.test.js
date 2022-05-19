const { getActivityText } = require('../../../../../app/lib/auth/get-activity-text')
const loginTypes = require('../../../../../app/constants/login-types')

describe('get activity text', () => {
  test.each([
    { journeyType: loginTypes.apply, expectedText: 'The email includes a link to apply for a review. This link will expire in 15 minutes.' },
    { journeyType: loginTypes.claim, expectedText: 'The email includes a link to claim fundng. This link will expire in 15 minutes.' }
  ])('is correct for journey type - $journeyType', ({ journeyType, expectedText }) => {
    const res = getActivityText(journeyType)

    expect(res).toEqual(expectedText)
  })
})
