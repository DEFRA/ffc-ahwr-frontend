module.exports = {
  method: 'GET',
  path: '/cph-list',
  options: {
    auth: false,
    handler: async (_, h) => {
      console.log('CPH-LIST')
      return h.view('temp/cph-list')
    }
  }
}
