module.exports = [{
  method: 'GET',
  path: '/vet/enter-reference',
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('vet/enter-reference')
    }
  }
}]
