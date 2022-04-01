const session = require('../../session')
const { vetSignup: { email: emailKey } } = require('../../session/keys')

module.exports = {
  method: 'GET',
  path: '/vet/check-email',
  options: {
    auth: false,
    handler: async (request, h) => {
      const email = session.getVetSignup(request, emailKey)
      return h.view('vet/check-email', { email })
    }
  }
}
