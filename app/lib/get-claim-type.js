const species = require('../constants/species')

// TODO: This will need refactoring when the changes to the farmer apply
// preventing multi species applications happen. Currently hardcoded to sheep.
function getClaimType (claimData) {
  const { cattle, cattleType, pigs, sheep } = claimData
  if (cattle === 'yes') {
    if (cattleType === 'both' || cattleType === species.beef) {
      return species.beef
    } else if (cattleType === species.dairy) {
      return species.dairy
    }
  } else if (pigs === 'yes') {
    return species.pigs
  } else if (sheep === 'yes') {
    return species.sheep
  } else {
    throw new Error('Unexpected species combination detected')
  }
}

module.exports = {
  getClaimType
}
