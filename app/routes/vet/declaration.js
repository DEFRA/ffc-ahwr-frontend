const backLink = '/vet/check-answers'

module.exports = {
  method: 'GET',
  path: '/vet/declaration',
  options: {
    handler: async (_, h) => {
      return h.view('vet/declaration', { backLink })
    }
  }
}
