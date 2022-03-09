const backLink = '/farmer-apply/check-answers'

module.exports = {
  method: 'GET',
  path: '/farmer-apply/declaration',
  options: {
    handler: async (_, h) => {
      return h.view('farmer-apply/declaration', { backLink })
    }
  }
}
