const amounts = require('../constants/amounts')

// TODO: This will need refactoring when the changes to the farmer apply
// preventing multi species applications happen. Currently hardcoded to sheep.
function getClaimAmount (claimData) {
  const { cattle, cattleType, pigs, sheep } = claimData
  if (cattle === 'yes') {
    console.log(cattle, cattleType)
    if (cattleType === 'both' || cattleType === 'beef') {
      return amounts.beef
    } else if (cattleType === 'dairy') {
      return amounts.dairy
    }
  } else if (pigs === 'yes') {
    return amounts.pigs
  } else if (sheep === 'yes') {
    return amounts.sheep
  } else {
    throw new Error('Unexpected species combination detected')
  }
}

module.exports = {
  getClaimAmount
}
