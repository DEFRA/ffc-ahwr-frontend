const session = require('../../session')

const backLink = '/vet/visit-date'

module.exports = {
  method: 'GET',
  path: '/vet/check-answers',
  options: {
    handler: async (request, h) => {
      const application = session.getApplication(request)

      const rows = []

      return h.view('vet/check-answers', { listData: { rows }, backLink })
    }
  }
}
