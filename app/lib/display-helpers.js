const species = require('../constants/species')
const { getClaimType } = require('./get-claim-type')
const { vetVisitData } = require('../session/keys')

function getSpeciesTestRowForDisplay (claim) {
  const claimData = claim.data
  const visitData = claim.vetVisit.data
  const claimType = getClaimType(claimData)

  switch (claimType) {
    case species.beef:
      return { key: { text: 'BVD in herd' }, value: { text: upperFirstLetter(visitData[vetVisitData.speciesTest]) } }
    case species.dairy:
      return { key: { text: 'BVD in herd' }, value: { text: upperFirstLetter(visitData[vetVisitData.speciesTest]) } }
    case species.pigs:
      return { key: { text: 'PRRS in herd' }, value: { text: upperFirstLetter(visitData[vetVisitData.speciesTest]) } }
    case species.sheep:
      return { key: { text: 'Percentage reduction in eggs per gram (EPG)' }, value: { text: visitData[vetVisitData.sheepTest] } }
  }
}

function getTypeOfReviewForDisplay (claimData) {
  return {
    beef: 'Beef cattle',
    dairy: 'Dairy cattle',
    pigs: 'Pigs',
    sheep: 'Sheep'
  }[getClaimType(claimData)]
}

function getTypeOfReviewRowForDisplay (claimData) {
  return { key: { text: 'Type of review' }, value: { text: getTypeOfReviewForDisplay(claimData) } }
}

function upperFirstLetter (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

module.exports = {
  getSpeciesTestRowForDisplay,
  getTypeOfReviewRowForDisplay,
  upperFirstLetter
}
