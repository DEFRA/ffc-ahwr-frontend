const species = require('../constants/species')
const { getClaimType } = require('./get-claim-type')
const { vetVisitData } = require('../session/keys')

function cattleTest (speciesTest, visitData) {
  speciesTest.push({ key: { text: 'Herd vaccinated for BVD' }, value: { text: upperFirstLetter(visitData[vetVisitData?.speciesVaccinated]) } })

  if (visitData[vetVisitData?.speciesLastVaccinated]) {
    speciesTest.push({ key: { text: 'Herd last vaccinated for BVD' }, value: { text: `${visitData[vetVisitData?.speciesLastVaccinated].month}/${visitData[vetVisitData?.speciesLastVaccinated].year}` } })
    speciesTest.push({ key: { text: 'Breeding cattle up to date' }, value: { text: upperFirstLetter(visitData[vetVisitData?.speciesVaccinationUpToDate]) } })
  }

  speciesTest.push({ key: { text: 'BVD in herd' }, value: { text: upperFirstLetter(visitData[vetVisitData?.speciesTest]) } })
}

function getSpeciesTestRowForDisplay (claim) {
  const claimData = claim.data
  const visitData = claim.vetVisit.data
  const claimType = getClaimType(claimData)
  const speciesTest = []

  switch (claimType) {
    case species.beef:
      cattleTest(speciesTest, visitData)
      break
    case species.dairy:
      cattleTest(speciesTest, visitData)
      break
    case species.pigs:
      speciesTest.push({ key: { text: 'PRRS in herd' }, value: { text: upperFirstLetter(visitData[vetVisitData.speciesTest]) } })
      break
    case species.sheep:
      if (visitData[vetVisitData?.sheepWormTreatment]) {
        speciesTest.push({ key: { text: 'Active chemical used in worming treatment' }, value: { text: visitData[vetVisitData?.sheepWormTreatment] } })
        speciesTest.push({ key: { text: 'Percentage reduction in eggs per gram (EPG)' }, value: { text: visitData[vetVisitData?.speciesTest] } })
      }
      break
  }

  return speciesTest
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
