const boom = require('@hapi/boom')
const Joi = require('joi')
const { getByEmail } = require('../../api-requests/users')
const { getClaim } = require('../../messaging/application')
const { setClaim } = require('../../session')
const { sendFarmerApplyLoginMagicLink, sendFarmerClaimLoginMagicLink } = require('../../lib/email/send-magic-link-email')
const { email: emailValidation } = require('../../../app/lib/validation/email')
const loginTypes = require('../../constants/login-types')

function cacheClaim (claim, request) {
  Object.entries(claim).forEach(([k, v]) => setClaim(request, k, v))
}

function getLoggedInPath (journey) {
  switch (journey) {
    case loginTypes.apply:
      return '/farmer-apply/org-review'
    case loginTypes.claim:
      return '/farmer-claim/visit-review'
  }
}

function getHintText (journey) {
  switch (journey) {
    case loginTypes.apply:
      return 'We\'ll use this to send you a link to apply for a review.'
    case loginTypes.claim:
      return 'We\'ll use this to send you a link to claim funding for a review.'
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
        journey: Joi.string().valid(...Object.values(loginTypes))
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
      const hintText = getHintText(journey)
      return h.view('auth/magic-login', { hintText })
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
        journey: Joi.string().valid(...Object.values(loginTypes))
      }),
      failAction: async (request, h, error) => {
        return h.view('auth/magic-login', { ...request.payload, errorMessage: { text: error.details[0].message }, hintText: getHintText(request.params.journey) }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { email } = request.payload
      const user = await getByEmail(email)
      const { journey } = request.params
      const hintText = getHintText(journey)

      if (!user) {
        return h.view('auth/magic-login', { ...request.payload, errorMessage: { text: `No user found with email address "${email}"` }, hintText }).code(400).takeover()
      }

      let result
      if (journey === loginTypes.apply) {
        result = await sendFarmerApplyLoginMagicLink(request, email)
      } else if (journey === loginTypes.claim) {
        const claim = await getClaim(email, request.yar.id)
        if (!claim) {
          return h.view('auth/magic-login', { ...request.payload, errorMessage: { text: `No application found for ${email}. Please call the Rural Payments Agency on 03000 200 301 if you believe this is an error.`, hintText } }).code(400).takeover()
        }

        if (!claim.vetVisit) {
          return h.view('auth/magic-login', { ...request.payload, errorMessage: { text: 'No vet visit has been completed. Please call the Rural Payments Agency on 03000 200 301 if you believe this is an error.', hintText } }).code(400).takeover()
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
