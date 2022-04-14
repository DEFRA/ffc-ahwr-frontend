const session = require('../../session')
const { vetVisitData } = require('../../session/keys')

const backLink = '/vet/visit-date'

function getVisitDate (application) {
  const visitDate = application[vetVisitData.visitDate]
  return visitDate.map(item => item.value).join(' ')
}

module.exports = {
  method: 'GET',
  path: '/vet/check-answers',
  options: {
    handler: async (request, h) => {
      const application = session.getVetVisitData(request)
      const rows = [{
        key: { text: 'Farm visit date' },
        value: { html: getVisitDate(application) },
        actions: { items: [{ href: '/vet/visit-date', text: 'Change', visuallyHiddenText: 'name' }] }
      }]

      return h.view('vet/check-answers', { listData: { rows }, backLink })
    }
  }
}
