module.exports = {
  method: 'GET',
  path: '/vet',
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('vet/index')
    }
  }
}
