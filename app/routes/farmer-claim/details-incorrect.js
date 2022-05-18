module.exports = {
  method: 'GET',
  path: '/farmer-claim/details-incorrect',
  options: {
    handler: async (_, h) => {
      return h.view('farmer-claim/details-incorrect')
    }
  }
}
