const routes = [].concat(
  require('../routes/accessibility'),
  require('../routes/assets'),
  require('../routes/cookies'),
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../routes/home'),
  require('../routes/auth/verify-login'),
  require('../routes/farmer/login'),
  require('../routes/farmer-apply/cattle'),
  require('../routes/farmer-apply/cattle-type'),
  require('../routes/farmer-apply/check-answers'),
  require('../routes/farmer-apply/confirmation'),
  require('../routes/farmer-apply/declaration'),
  require('../routes/farmer-apply/not-eligible'),
  require('../routes/farmer-apply/org-review'),
  require('../routes/farmer-apply/pigs'),
  require('../routes/farmer-apply/sheep'),
  require('../routes/farmer-claim'),
  require('../routes/farmer-claim/visit-review'),
  require('../routes/privacy-policy'),
  require('../routes/vet'),
  require('../routes/vet/check-answers'),
  require('../routes/vet/check-email'),
  require('../routes/vet/confirmation'),
  require('../routes/vet/declaration'),
  require('../routes/vet/email'),
  require('../routes/vet/name'),
  require('../routes/vet/practice'),
  require('../routes/vet/rcvs'),
  require('../routes/vet/reference'),
  require('../routes/vet/beef-eligibility'),
  require('../routes/vet/sheep-eligibility'),
  require('../routes/vet/visit-date')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, _) => {
      server.route(routes)
    }
  }
}
