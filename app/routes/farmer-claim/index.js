module.exports = {
  method: 'GET',
  path: '/farmer-claim',
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('farmer-claim/index')
    }
  }
}
