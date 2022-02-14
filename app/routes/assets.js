module.exports = {
  method: 'GET',
  path: '/assets/{path*}',
  options: {
    handler: {
      directory: {
        path: ['app/frontend/dist', 'node_modules/govuk-frontend/govuk/assets']
      }
    },
    cache: {
      privacy: 'private'
    }
  }
}
