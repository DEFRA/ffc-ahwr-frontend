const species = require('../../constants/species')
const { getClaimType } = require('../../lib/get-claim-type')
const session = require('../../session')
const { vetVisitData } = require('../../session/keys')

const backLink = '/vet/review-report'

function getVisitDate (vetVisit) {
  const visitDate = vetVisit[vetVisitData.visitDate]
  return new Date(visitDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

function hasEligibleNumberOfAnimals (vetVisit) {
  const claimType = getClaimType(vetVisit.farmerApplication.data)

  switch (claimType) {
    case species.sheep:
      return vetVisit[vetVisitData.sheep] || 'no'
    case species.pigs:
      return vetVisit[vetVisitData.pigs] || 'no'
    case species.beef:
      return vetVisit[vetVisitData.beef] || 'no'
    case species.dairy:
      return vetVisit[vetVisitData.dairy] || 'no'
  }
}

const path = 'vet/check-answers'
module.exports = [{
  method: 'GET',
  path: `/${path}`,
  options: {
    handler: async (request, h) => {
      const vetVisit = session.getVetVisitData(request)
      const claimType = getClaimType(vetVisit.farmerApplication.data)
      const eligibilityPath = `/vet/${claimType}-eligibility`
      const rows = [{
        key: { text: 'Farm visit date' },
        value: { text: getVisitDate(vetVisit) },
        actions: { items: [{ href: '/vet/visit-date', text: 'Change', visuallyHiddenText: 'change visit date' }] }
      }, {
        key: { text: 'Eligible number of animals' },
        value: { text: hasEligibleNumberOfAnimals(vetVisit) },
        actions: { items: [{ href: eligibilityPath, text: 'Change', visuallyHiddenText: 'change eligible number of animals' }] }
      }]

      let text
      let value
      let href
      switch (claimType) {
        case species.beef:
          text = 'BVD in herd'
          value = vetVisit[vetVisitData.beefTest]
          href = '/vet/beef-test'
          break
        case species.sheep:
          text = 'Worming treatment effectiveness'
          value = vetVisit[vetVisitData.sheepTest]
          href = '/vet/sheep-test'
          break
        case species.dairy:
          text = 'BVD in herd'
          value = vetVisit[vetVisitData.dairyTest]
          href = '/vet/dairy-test'
          break
        case species.pigs:
          text = 'PRRS in herd'
          value = vetVisit[vetVisitData.pigsTest]
          href = '/vet/pigs-test'
          break
        default:
      }

      rows.push({
        key: { text },
        value: { text: value },
        actions: { items: [{ href, text: 'Change', visuallyHiddenText: 'change test result' }] }
      })

      rows.push({
        key: { text: 'Written report given to farmer' },
        value: { text: vetVisit[vetVisitData.reviewReport] },
        actions: { items: [{ href: '/vet/review-report', text: 'Change', visuallyHiddenText: 'change report provided' }] }
      })

      return h.view(path, { listData: { rows }, backLink })
    }
  }
},
{
  method: 'POST',
  path: `/${path}`,
  options: {
    handler: async (_, h) => {
      return h.redirect('/vet/declaration')
    }
  }
}]
