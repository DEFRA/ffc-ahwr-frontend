const routes = [].concat(
  require('../routes/assets'),
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../routes/home'),
  require('../routes/auth/login'),
  require('../routes/farmer-apply/cattle'),
  require('../routes/farmer-apply/cattle-type'),
  require('../routes/farmer-apply/check-answers'),
  require('../routes/farmer-apply/confirmation'),
  require('../routes/farmer-apply/declaration'),
  require('../routes/farmer-apply/not-eligible'),
  require('../routes/farmer-apply/org-review'),
  require('../routes/farmer-apply/pigs'),
  require('../routes/farmer-apply/sheep')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, _) => {
      server.route(routes)
    }
  }
}
