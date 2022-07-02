const { getClaimAmount } = require('../../../../app/lib/get-claim-amount')
const amounts = require('../../../../app/constants/amounts')
const species = require('../../../../app/constants/species')

describe('getClaimAmount returns correct amount', () => {
  test.each([
    { whichReview: species.pigs, amount: amounts.pigs },
    { whichReview: species.sheep, amount: amounts.sheep },
    { whichReview: species.beef, amount: amounts.beef },
    { whichReview: species.dairy, amount: amounts.dairy }
  ])('for $species', ({ whichReview, amount }) => {
    const res = getClaimAmount({ whichReview })

    expect(res).toEqual(amount)
  })

  test('error thrown when species are not matched', () => {
    expect(() => getClaimAmount({})).toThrow(new Error('No claim type found for, \'whichReview\' property empty.'))
  })
})
