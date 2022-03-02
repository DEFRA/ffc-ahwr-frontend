module.exports = {
  method: 'GET',
  path: '/farmer-apply/not-eligible',
  options: {
    handler: async (_, h) => {
      return h.view('farmer-apply/not-eligible')
    }
  }
}
