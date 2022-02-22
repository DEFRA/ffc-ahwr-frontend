const routes = [].concat(
  require('../routes/assets'),
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../routes/home'),
  require('../routes/auth/login'),
  require('../routes/farmer-apply/eligible-organisations')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, _) => {
      server.route(routes)
    }
  }
}
