const { cacheKeys } = require('../../config/constants')

const backLink = '/farmer-apply/pigs'

function hasEligibleLivestock (yar) {
  const hasCattle = yar.get(cacheKeys.cattle) === 'yes'
  const hasSheep = yar.get(cacheKeys.sheep) === 'yes'
  const hasPigs = yar.get(cacheKeys.pigs) === 'yes'

  return hasCattle || hasSheep || hasPigs
}

function getLivestockHtml (yar) {
  const livestockText =
    (yar.get(cacheKeys.cattle) === 'yes' ? 'More than 10 cattle<br>' : '') +
    (yar.get(cacheKeys.sheep) === 'yes' ? 'More than 20 sheep<br>' : '') +
    (yar.get(cacheKeys.pigs) === 'yes' ? 'More than 50 pigs<br>' : '')

  return livestockText.slice(0, -4)
}

function getCattleTypeText (cattleType) {
  return cattleType === 'both' ? 'Beef and Dairy' : cattleType.charAt(0).toUpperCase() + cattleType.slice(1)
}

module.exports = {
  method: 'GET',
  path: '/farmer-apply/check-answers',
  options: {
    handler: async (request, h) => {
      if (!hasEligibleLivestock(request.yar)) {
        return h.redirect('/farmer-apply/not-eligible')
      }

      const rows = [
        {
          key: { text: 'Livestock' },
          value: { html: getLivestockHtml(request.yar) },
          actions: { items: [{ href: '/farmer-apply/cattle', text: 'Change', visuallyHiddenText: 'name' }] }
        },
        ...(request.yar.get(cacheKeys.cattle) === 'yes'
          ? [{
              key: { text: 'Cattle type' },
              value: { text: getCattleTypeText(request.yar.get(cacheKeys.cattleType)) },
              actions: { items: [{ href: '/farmer-apply/cattle-type', text: 'Change', visuallyHiddenText: 'name' }] }
            }]
          : [])
      ]

      return h.view('farmer-apply/check-answers', { listData: { rows }, backLink })
    }
  }
}
