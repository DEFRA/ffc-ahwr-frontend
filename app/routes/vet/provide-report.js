module.exports = {
  method: 'GET',
  path: '/vet/provide-report',
  options: {
    handler: async (_, h) => {
      return h.view('vet/provide-report')
    }
  }
}
