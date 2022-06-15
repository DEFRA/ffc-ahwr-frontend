const species = require('../../constants/species')
const { getClaimType } = require('../../lib/get-claim-type')
const session = require('../../session')
const { vetVisitData } = require('../../session/keys')
const { upperFirstLetter } = require('../../lib/display-helpers')

const backLink = '/vet/review-report'

function getVisitDate (vetVisit) {
  const visitDate = vetVisit[vetVisitData.visitDate]
  return new Date(visitDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
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
        value: { text: upperFirstLetter(vetVisit[vetVisitData.eligibleSpecies]) },
        actions: { items: [{ href: eligibilityPath, text: 'Change', visuallyHiddenText: 'change eligible number of animals' }] }
      }]

      let text
      let value
      let href
      switch (claimType) {
        case species.beef:
          text = 'BVD in herd'
          value = upperFirstLetter(vetVisit[vetVisitData.speciesTest])
          href = '/vet/beef-test'
          break
        case species.sheep:
          text = 'Percentage reduction in eggs per gram (EPG)'
          value = vetVisit[vetVisitData.speciesTest]
          href = '/vet/sheep-test'
          break
        case species.dairy:
          text = 'BVD in herd'
          value = upperFirstLetter(vetVisit[vetVisitData.speciesTest])
          href = '/vet/dairy-test'
          break
        case species.pigs:
          text = 'PRRS in herd'
          value = upperFirstLetter(vetVisit[vetVisitData.speciesTest])
          href = '/vet/pigs-test'
          break
      }

      rows.push({
        key: { text },
        value: { text: value },
        actions: { items: [{ href, text: 'Change', visuallyHiddenText: 'change test result' }] }
      })

      rows.push({
        key: { text: 'Written report given to farmer' },
        value: { text: upperFirstLetter(vetVisit[vetVisitData.reviewReport]) },
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
