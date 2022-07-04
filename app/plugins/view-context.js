const { journeys, serviceName } = require('../config')

module.exports = {
  plugin: {
    name: 'view-context',
    register: (server, _) => {
      server.ext('onPreResponse', function (request, h) {
        const response = request.response

        if (response.variety === 'view') {
          const ctx = response.source.context || {}

          const { path } = request

          let journeyTitle = serviceName
          let serviceUrl = '/'
          if (path.startsWith('/vet')) {
            journeyTitle = journeys.vet.title
            serviceUrl = '/vet'
          } else if (path.startsWith('/farmer-apply')) {
            journeyTitle = journeys.farmerApply.title
            serviceUrl = '/farmer-apply'
          } else if (path.startsWith('/farmer-claim')) {
            journeyTitle = journeys.farmerClaim.title
            serviceUrl = '/farmer-claim'
          } else if (path.startsWith('/cookies')) {
            serviceUrl = '/cookies'
          }
          ctx.serviceName = journeyTitle
          ctx.serviceUrl = serviceUrl

          response.source.context = ctx
        }

        return h.continue
      })
    }
  }
}
