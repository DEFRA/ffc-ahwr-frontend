const boom = require('@hapi/boom')
const session = require('../../session')

module.exports = {
  method: 'GET',
  path: '/vet',
  options: {
    handler: async (request, h) => {
      const organisation = session.getOrganisation(request)
      if (!organisation) {
        return boom.notFound()
      }

      const rows = [
        { key: { text: 'SBI number:' }, value: { text: organisation.sbi } },
        { key: { text: 'CPH number:' }, value: { text: organisation.cph } },
        { key: { text: 'Address:' }, value: { text: organisation.address } },
        { key: { text: 'Contact email address:' }, value: { text: organisation.email } }
      ]
      return h.view('farmer-apply/org-review', { organisation, listData: { rows } })
    }
  }
}
