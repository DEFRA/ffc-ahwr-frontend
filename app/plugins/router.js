const routes = [].concat(
  require('../routes/assets'),
  require('../routes/auth/verify-login'),
  require('../routes/cookies'),
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../routes/farmer/login'),
  require('../routes/farmer-apply'),
  require('../routes/farmer-apply/check-answers'),
  require('../routes/farmer-apply/declaration'),
  require('../routes/farmer-apply/not-eligible'),
  require('../routes/farmer-apply/org-review'),
  require('../routes/farmer-apply/species-eligibility'),
  require('../routes/farmer-apply/which-review'),
  require('../routes/farmer-claim'),
  require('../routes/farmer-claim/details-incorrect'),
  require('../routes/farmer-claim/submit-claim'),
  require('../routes/farmer-claim/visit-review'),
  require('../routes/vet'),
  require('../routes/vet/check-answers'),
  require('../routes/vet/check-review'),
  require('../routes/vet/confirmation'),
  require('../routes/vet/declaration'),
  require('../routes/vet/details-incorrect'),
  require('../routes/vet/email'),
  require('../routes/vet/name'),
  require('../routes/vet/practice'),
  require('../routes/vet/provide-report'),
  require('../routes/vet/rcvs'),
  require('../routes/vet/reference'),
  require('../routes/vet/review-report'),
  require('../routes/vet/sheep-test'),
  require('../routes/vet/sheep-worms'),
  require('../routes/vet/species-eligibility'),
  require('../routes/vet/species-test'),
  require('../routes/vet/species-vaccinated'),
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
