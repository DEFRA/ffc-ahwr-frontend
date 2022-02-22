const Joi = require('joi')
const { getOrgByReference } = require('../../api-requests/orgs')
const { cacheKeys } = require('../../config/constants')

module.exports = [{
  method: 'GET',
  path: '/login',
  options: {
    auth: {
      mode: 'try'
    },
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: async (request, h) => {
      if (request.auth.isAuthenticated) {
        return h.redirect(request.query?.next || 'farmer-apply/org-review')
      }
      return h.view('auth/beta-login')
    }
  }
}, {
  method: 'POST',
  path: '/login',
  options: {
    auth: {
      mode: 'try'
    },
    validate: {
      payload: Joi.object({
        reference: Joi.string().pattern(/^\d{4}$/).required(),
        sbi: Joi.string().pattern(/^\d{9}$/).required()
      }),
      failAction: async (request, h, error) => {
        console.error(error)
        return h.view('auth/beta-login', { ...request.payload, errors: error }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
<<<<<<< HEAD
      const { reference, sbi } = request.payload
      const org = getOrgByReference(reference)

      if (!org || org.sbi !== sbi) {
        const errors = { details: [{ message: `No orgnisation found with reference '${reference}' and sbi '${sbi}'` }] }
        return h.view('auth/beta-login', { ...request.payload, errors }).code(400).takeover()
      }

      request.cookieAuth.set({ reference })
      request.yar.set(cacheKeys.org, org)

      return h.redirect(request.query?.next || 'farmer-apply/org-review')
=======
      const { callerId, crn } = request.payload
      const sid = uuidv4()
      request.cookieAuth.set({ sid })
      await request.server.app.cache.set(sid, { callerId, crn })
      // TODO: Depends what eligibility checking is required as to what happens
      // here. Temporarily list dummy CPHs.
      return h.redirect('/eligible-organisations')
>>>>>>> feat: list eligibile orgs
    }
  }
}]
