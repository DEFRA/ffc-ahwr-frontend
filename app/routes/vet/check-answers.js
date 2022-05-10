const session = require('../../session')
const { vetVisitData } = require('../../session/keys')

const backLink = '/vet/visit-date'

function getVisitDate (vetVisit) {
  const visitDate = vetVisit[vetVisitData.visitDate]
  return new Date(visitDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}
function getWhichReview (application) {
  if (application.data.cattle === 'yes') {
    return application.data.cattleType
  }
  return application.data.pigs === 'yes' ? 'pigs' : 'sheep'
}
module.exports = [{
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
},
{
  method: 'POST',
  path: '/vet/check-answers',
  options: {
    handler: async (request, h) => {
      // Check what selected in Former application and then redirect to respective page => beef/pigs/sheep/dairy
      const application = session.getVetVisitData(request, vetVisitData.farmerApplication)
      return h.redirect(`/vet/${getWhichReview(application)}-eligibility`)
    }
  }
}]
