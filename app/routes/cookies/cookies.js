module.exports = {
  method: 'GET',
  path: '/cookies',
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('cookies/cookie-policy')
    }
  }
}
