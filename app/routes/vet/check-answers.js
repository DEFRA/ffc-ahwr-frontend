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

function cattle (rows, vetVisit) {
  const speciesVaccinated = vetVisit[vetVisitData.speciesVaccinated]

  if (speciesVaccinated) {
    rows.push({
      key: { text: 'Herd vaccinated for BVD' },
      value: { text: upperFirstLetter(speciesVaccinated) },
      actions: { items: [{ href: '/vet/beef-vaccinated', text: 'Change', visuallyHiddenText: 'change test result' }] }
    })
  }

  const speciesLastVaccinated = vetVisit[vetVisitData.speciesLastVaccinated]

  if (speciesLastVaccinated) {
    rows.push({
      key: { text: 'Herd last vaccinated for BVD' },
      value: { text: `${speciesLastVaccinated.month}/${speciesLastVaccinated.year}` },
      actions: { items: [{ href: '/vet/beef-last-vaccinated', text: 'Change', visuallyHiddenText: 'change test result' }] }
    })
  }

  const speciesVaccinationUpToDate = vetVisit[vetVisitData.speciesVaccinationUpToDate]

  if (speciesVaccinationUpToDate) {
    rows.push({
      key: { text: 'Breeding cattle up to date' },
      value: { text: upperFirstLetter(speciesVaccinationUpToDate) },
      actions: { items: [{ href: '/vet/beef-vaccination-up-to-date', text: 'Change', visuallyHiddenText: 'change test result' }] }
    })
  }
  rows.push({
    key: { text: 'BVD in herd' },
    value: { text: upperFirstLetter(vetVisit[vetVisitData.speciesTest]) },
    actions: { items: [{ href: '/vet/beef-test', text: 'Change', visuallyHiddenText: 'change test result' }] }
  })
}

function sheep (rows, vetVisit) {
  if (vetVisit[vetVisitData.sheepWorms]) {
    rows.push({
      key: { text: 'Worms in first check' },
      value: { text: upperFirstLetter(vetVisit[vetVisitData.sheepWorms]) },
      actions: { items: [{ href: '/vet/sheep-worms', text: 'Change', visuallyHiddenText: 'change test result' }] }
    })
  }

  if (vetVisit[vetVisitData.speciesTest]) {
    rows.push({
      key: { text: 'Active chemical used in worming treatment' },
      value: { text: vetVisit[vetVisitData.sheepWormTreatment] },
      actions: { items: [{ href: '/vet/sheep-worming-treatment', text: 'Change', visuallyHiddenText: 'change test result' }] }
    })

    rows.push({
      key: { text: 'Percentage reduction in eggs per gram (EPG)' },
      value: { text: vetVisit[vetVisitData.speciesTest] },
      actions: { items: [{ href: '/vet/sheep-test', text: 'Change', visuallyHiddenText: 'change test result' }] }
    })
  }
}

function pigs (rows, vetVisit) {
  rows.push({
    key: { text: 'PRRS in herd' },
    value: { text: upperFirstLetter(vetVisit[vetVisitData.speciesTest]) },
    actions: { items: [{ href: '/vet/pigs-test', text: 'Change', visuallyHiddenText: 'change test result' }] }
  })
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

      switch (claimType) {
        case species.beef:
          cattle(rows, vetVisit)
          break
        case species.sheep:
          sheep(rows, vetVisit)
          break
        case species.dairy:
          cattle(rows, vetVisit)
          break
        case species.pigs:
          pigs(rows, vetVisit)
          break
      }

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
