module.exports = {
  method: 'GET',
  path: '/farmer-claim/submit-claim',
  options: {
    handler: async (_, h) => {
      return h.view('farmer-claim/submit-claim')
    }
  }
}
