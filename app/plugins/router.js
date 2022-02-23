const routes = [].concat(
  require('../routes/assets'),
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../routes/home'),
  require('../routes/auth/login'),
  require('../routes/farmer-apply/check-answers'),
  require('../routes/farmer-apply/confirmation'),
  require('../routes/farmer-apply/declaration'),
  require('../routes/farmer-apply/eligible-organisations'),
  require('../routes/farmer-apply/org-review')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, _) => {
      server.route(routes)
    }
  }
}
