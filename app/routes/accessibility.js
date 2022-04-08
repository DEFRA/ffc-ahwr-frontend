module.exports = {
  method: 'GET',
  path: '/accessibility',
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('accessibility', { accessibility: 'accessibility' })
    }
  }
}
