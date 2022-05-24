const { getClaimType } = require('./get-claim-type')
const { vetVisitData } = require('../session/keys')

function getSpeciesTestRowForDisplay (claim) {
  const claimData = claim.data
  const visitData = claim.vetVisit.data

  return {
    beef: { key: { text: 'BVD in herd' }, value: { text: visitData[vetVisitData.beefTest] } },
    dairy: { key: { text: 'BVD in herd' }, value: { text: visitData[vetVisitData.dairyTest] } },
    pigs: { key: { text: 'PRRS in herd' }, value: { text: visitData[vetVisitData.pigsTest] } },
    sheep: { key: { text: 'Percentage reduction in eggs per gram (EPG)' }, value: { text: `${visitData[vetVisitData.sheepTest]}%` } }
  }[getClaimType(claimData)]
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

module.exports = {
  getSpeciesTestRowForDisplay,
  getTypeOfReviewRowForDisplay
}
