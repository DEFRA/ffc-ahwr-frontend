module.exports = {
  method: 'GET',
  path: '/healthz',
  options: {
    auth: false,
    handler: (_, h) => {
      return h.response('ok').code(200)
    }
  }
}
