const { journeys, serviceName } = require('../config')

module.exports = {
  plugin: {
    name: 'view-context',
    register: (server, _) => {
      server.ext('onPreResponse', function (request, h) {
        const response = request.response

        if (response.variety === 'view') {
          const ctx = response.source.context || {}

          console.log('path:', request.path)
          const { path } = request

          let journeyTitle = serviceName
          if (path.startsWith('/vet')) {
            journeyTitle = journeys.vet.title
          } else if (path.startsWith('/farmer-apply')) {
            journeyTitle = journeys.farmerApply.title
          } else if (path.startsWith('/farmer-claim')) {
            journeyTitle = journeys.farmerClaim.title
          }
          ctx.serviceName = journeyTitle

          response.source.context = ctx
        }

        return h.continue
      })
    }
  }
}
