const { getClaimAmount } = require('../../../../app/lib/get-claim-amount')
const amounts = require('../../../../app/constants/amounts')

describe('getClaimAmount returns correct amount', () => {
  test.each([
    { species: 'pigs', cattle: '', amount: amounts.pigs },
    { species: 'sheep', cattle: '', amount: amounts.sheep },
    { species: 'beef', cattle: 'yes', amount: amounts.beef },
    { species: 'both', cattle: 'yes', amount: amounts.beef },
    { species: 'dairy', cattle: 'yes', amount: amounts.dairy }
  ])('for $species', ({ species, cattle, amount }) => {
    const claimData = {
      pigs: '',
      sheep: ''
    }
    if (cattle === 'yes') {
      claimData.cattle = cattle
      claimData.cattleType = species
    } else {
      claimData[species] = 'yes'
    }

    const res = getClaimAmount(claimData)

    expect(res).toEqual(amount)
  })

  test('error thrown when species are not matched', () => {
    expect(() => getClaimAmount({})).toThrow(new Error('Unexpected species combination detected'))
  })
})
