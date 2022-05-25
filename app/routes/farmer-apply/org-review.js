const boom = require('@hapi/boom')
const session = require('../../session')
const { farmerApplyData: { organisation: organisationKey } } = require('../../session/keys')

module.exports = {
  method: 'GET',
  path: '/farmer-apply/org-review',
  options: {
    handler: async (request, h) => {
      const organisation = session.getFarmerApplyData(request, organisationKey)
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
