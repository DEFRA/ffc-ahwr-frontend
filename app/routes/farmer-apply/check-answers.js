const { cacheKeys } = require('../../config/constants')
const session = require('../helpers/session')

const backLink = '/farmer-apply/pigs'

function hasEligibleLivestock (application) {
  const hasCattle = application[cacheKeys.cattle] === 'yes'
  const hasSheep = application[cacheKeys.sheep] === 'yes'
  const hasPigs = application[cacheKeys.pigs] === 'yes'

  return hasCattle || hasSheep || hasPigs
}

function getLivestockHtml (application) {
  const livestockText =
    (application[cacheKeys.cattle] === 'yes' ? 'More than 10 cattle<br>' : '') +
    (application[cacheKeys.sheep] === 'yes' ? 'More than 20 sheep<br>' : '') +
    (application[cacheKeys.pigs] === 'yes' ? 'More than 50 pigs<br>' : '')

  return livestockText.slice(0, -4)
}

function getCattleTypeText (application) {
  const cattleType = application[cacheKeys.cattleType]
  return cattleType === 'both' ? 'Beef and Dairy' : cattleType.charAt(0).toUpperCase() + cattleType.slice(1)
}

module.exports = {
  method: 'GET',
  path: '/farmer-apply/check-answers',
  options: {
    handler: async (request, h) => {
      const application = session.getApplication(request)
      if (!hasEligibleLivestock(application)) {
        return h.redirect('/farmer-apply/not-eligible')
      }

      const rows = [
        {
          key: { text: 'Livestock' },
          value: { html: getLivestockHtml(application) },
          actions: { items: [{ href: '/farmer-apply/cattle', text: 'Change', visuallyHiddenText: 'name' }] }
        },
        ...(application[cacheKeys.cattle] === 'yes'
          ? [{
              key: { text: 'Cattle type' },
              value: { text: getCattleTypeText(application) },
              actions: { items: [{ href: '/farmer-apply/cattle-type', text: 'Change', visuallyHiddenText: 'name' }] }
            }]
          : [])
      ]

      return h.view('farmer-apply/check-answers', { listData: { rows }, backLink })
    }
  }
}
