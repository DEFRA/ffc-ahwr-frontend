const boom = require('@hapi/boom')
const { cacheKeys } = require('../../config/constants')

module.exports = {
  method: 'GET',
  path: '/farmer-apply/org-review',
  options: {
    handler: async (request, h) => {
      // Take org from cache - should be ok!
      const organisation = request.yar.get(cacheKeys.org)
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
