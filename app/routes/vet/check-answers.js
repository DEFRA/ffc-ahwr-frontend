const session = require('../../session')
const { vetVisitData } = require('../../session/keys')

const backLink = '/vet/visit-date'

function getVisitDate (vetVisit) {
  const visitDate = vetVisit[vetVisitData.visitDate]
  return new Date(visitDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

module.exports = {
  method: 'GET',
  path: '/vet/check-answers',
  options: {
    handler: async (request, h) => {
      const vetVisit = session.getVetVisitData(request)
      const rows = [{
        key: { text: 'Farm visit date' },
        value: { html: getVisitDate(vetVisit) },
        actions: { items: [{ href: '/vet/visit-date', text: 'Change', visuallyHiddenText: 'name' }] }
      }]

      return h.view('vet/check-answers', { listData: { rows }, backLink })
    }
  }
}
