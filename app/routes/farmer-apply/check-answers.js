const { answers } = require('../../session/keys')
const session = require('../../session')

const backLink = '/farmer-apply/pigs'

function hasEligibleLivestock (application) {
  const hasCattle = application[answers.cattle] === 'yes'
  const hasSheep = application[answers.sheep] === 'yes'
  const hasPigs = application[answers.pigs] === 'yes'

  return hasCattle || hasSheep || hasPigs
}

function getLivestockHtml (application) {
  const livestockText =
    (application[answers.cattle] === 'yes' ? 'More than 10 cattle<br>' : '') +
    (application[answers.sheep] === 'yes' ? 'More than 20 sheep<br>' : '') +
    (application[answers.pigs] === 'yes' ? 'More than 50 pigs<br>' : '')

  return livestockText.slice(0, -4)
}

function getCattleTypeText (application) {
  const cattleType = application[answers.cattleType]
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
        ...(application[answers.cattle] === 'yes'
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
