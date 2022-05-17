const { getClaimType } = require('../../lib/get-claim-type')
const session = require('../../session')
const { vetVisitData } = require('../../session/keys')

const backLink = '/vet/review-report'

function getVisitDate (vetVisit) {
  const visitDate = vetVisit[vetVisitData.visitDate]
  return new Date(visitDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

module.exports = [{
  method: 'GET',
  path: '/vet/check-answers',
  options: {
    handler: async (request, h) => {
      const vetVisit = session.getVetVisitData(request)
      const eligible = vetVisit[vetVisitData.sheep] || vetVisit[vetVisitData.beef] || vetVisit[vetVisitData.dairy]
      const claimType = getClaimType(vetVisit.farmerApplication.data)
      const eligibilityPath = `/vet/${claimType}-eligibility`
      const rows = [{
        key: { text: 'Farm visit date' },
        value: { html: getVisitDate(vetVisit) },
        actions: { items: [{ href: '/vet/visit-date', text: 'Change', visuallyHiddenText: 'name' }] }
      }, {
        key: { text: 'Eligible number of animals' },
        value: { html: eligible },
        actions: { items: [{ href: eligibilityPath, text: 'Change', visuallyHiddenText: 'name' }] }
      }]

      let text
      let value
      let path
      switch (claimType) {
        case 'beef':
          text = 'BVD in herd'
          value = vetVisit[vetVisitData.beefTest]
          path = '/vet/beef-test'
          break
        case 'sheep':
          text = 'Worming treatment effectiveness'
          value = vetVisit[vetVisitData.sheepEpg]
          path = '/vet/sheep-test'
          break
        case 'dairy':
          text = 'BVD in herd'
          value = vetVisit[vetVisitData.dairyTest]
          path = '/vet/dairy-test'
          break
        case 'pigs':
          text = 'PRRS in herd'
          value = 'TBD'
          path = '/vet/pigs-test'
          break
        default:
      }

      rows.push({
        key: { text },
        value: { html: value },
        actions: { items: [{ href: path, text: 'Change', visuallyHiddenText: 'name' }] }
      })

      rows.push({
        key: { text: 'Written report given to farmer' },
        value: { html: vetVisit[vetVisitData.reviewReport] },
        actions: { items: [{ href: '/vet/review-report', text: 'Change', visuallyHiddenText: 'name' }] }
      })

      return h.view('vet/check-answers', { listData: { rows }, backLink })
    }
  }
},
{
  method: 'POST',
  path: '/vet/check-answers',
  options: {
    handler: async (request, h) => {
      return h.redirect('/vet/declaration')
    }
  }
}]
