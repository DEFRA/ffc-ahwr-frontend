module.exports = {
  method: 'GET',
  path: '/vet/details-incorrect',
  options: {
    handler: async (_, h) => {
      return h.view('vet/details-incorrect')
    }
  }
}
