const session = require('../../session')

module.exports = {
  method: 'GET',
  path: '/vet/check-email',
  options: {
    auth: false,
    handler: async (request, h) => {
      const email = session.getVetSignup(request, 'email')
      return h.view('vet/check-email', { email })
    }
  }
}
