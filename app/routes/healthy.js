module.exports = {
  method: 'GET',
  path: '/healthy',
  options: {
    auth: false,
    handler: (_, h) => {
      return h.response('ok').code(200)
    }
  }
}
