module.exports = {
  method: 'GET',
  path: '/accessibility',
  options: {
    auth: false,
    handler: async (request, h) => {
      return h.view('accessibility', { accessibility: 'accessibility' })
    }
  }
}
