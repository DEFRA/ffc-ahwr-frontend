const boom = require('@hapi/boom')
const Joi = require('joi')
const { getByEmail } = require('../../api-requests/users')
const { getClaim } = require('../../messaging/application')
const { setClaim } = require('../../session')
const { sendFarmerApplyLoginMagicLink, sendFarmerClaimLoginMagicLink } = require('../../lib/email/send-magic-link-email')
const { email: emailValidation } = require('../../../app/lib/validation/email')

const validJourneys = {
  apply: 'apply',
  claim: 'claim'
}

function cacheClaim (claim, request) {
  Object.entries(claim).forEach(([k, v]) => setClaim(request, k, v))
}

function getLoggedInPath (journey) {
  switch (journey) {
    case validJourneys.apply:
      return '/farmer-apply/org-review'
    case validJourneys.claim:
      return '/farmer-claim/visit-review'
  }
}

module.exports = [{
  method: 'GET',
  path: '/farmer-{journey}/login',
  options: {
    auth: {
      mode: 'try'
    },
    validate: {
      params: Joi.object({
        journey: Joi.string().valid(...Object.values(validJourneys))
      })
    },
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: async (request, h) => {
      const { journey } = request.params
      if (request.auth.isAuthenticated) {
        const loggedInPath = getLoggedInPath(journey)
        return h.redirect(request.query?.next || loggedInPath)
      }
      return h.view('auth/magic-login')
    }
  }
}, {
  method: 'POST',
  path: '/farmer-{journey}/login',
  options: {
    auth: {
      mode: 'try'
    },
    validate: {
      payload: Joi.object({
        email: emailValidation
      }),
      params: Joi.object({
        journey: Joi.string().valid(...Object.values(validJourneys))
      }),
      failAction: async (request, h, error) => {
        return h.view('auth/magic-login', { ...request.payload, errorMessage: { text: error.details[0].message } }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { email } = request.payload
      const user = await getByEmail(email)

      if (!user) {
        return h.view('auth/magic-login', { ...request.payload, errorMessage: { text: `No user found with email address "${email}"` } }).code(400).takeover()
      }

      let result
      if (request.params.journey === validJourneys.apply) {
        result = await sendFarmerApplyLoginMagicLink(request, email)
      } else if (request.params.journey === validJourneys.claim) {
        const claim = await getClaim(email, request.yar.id)
        if (!claim) {
          return h.view('auth/magic-login', { ...request.payload, errorMessage: { text: `No application found for ${email}. Please call the Rural Payments Agency on 03000 200 301 if you believe this is an error.` } }).code(400).takeover()
        }

        if (!claim.vetVisit) {
          return h.view('auth/magic-login', { ...request.payload, errorMessage: { text: 'No vet visit has been completed. Please call the Rural Payments Agency on 03000 200 301 if you believe this is an error.' } }).code(400).takeover()
        }

        cacheClaim(claim, request)
        result = await sendFarmerClaimLoginMagicLink(request, email)
      }

      if (!result) {
        return boom.internal()
      }

      return h.view('auth/check-email', { email })
    }
  }
}]
