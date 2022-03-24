const boom = require('@hapi/boom')
const Joi = require('joi')
const { v4: uuid } = require('uuid')
const { getByEmail } = require('../../api-requests/users')
const { notify: { templateIdFarmerLogin }, serviceUri } = require('../../config')
const sendEmail = require('../../lib/send-email')

async function createAndCacheToken (req, email) {
  const { magiclinkCache } = req.server.app

  const token = uuid()
  const tokens = await magiclinkCache.get(email) ?? []
  tokens.push(token)
  await magiclinkCache.set(email, tokens)
  await magiclinkCache.set(token, email)
  return token
}

async function sendLoginEmail (email, token) {
  return await sendEmail(templateIdFarmerLogin, email, {
    personalisation: { magiclink: `${serviceUri}/verify-login?token=${token}&email=${email}` },
    reference: token
  })
}

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
      return h.view('auth/magic-login')
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
        email: Joi.string().email()
      }),
      failAction: async (request, h, error) => {
        return h.view('auth/magic-login', { ...request.payload, errors: error }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { email } = request.payload
      const org = await getByEmail(email)

      if (!org) {
        const errors = { details: [{ message: `No user found for email '${email}'` }] }
        return h.view('auth/magic-login', { ...request.payload, errors }).code(400).takeover()
      }

      const token = await createAndCacheToken(request, email)

      const result = await sendLoginEmail(email, token)

      if (!result) {
        return boom.internal()
      }

      return h.view('auth/check-email', { email })
    }
  }
}]
