const backLink = '/farmer-apply/cattle'

module.exports = {
  method: 'GET',
  path: '/farmer-apply/not-eligible',
  options: {
    handler: async (request, h) => {
      return h.view('farmer-apply/not-eligible', { backLink })
    }
  }
}
