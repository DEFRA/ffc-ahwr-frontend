const Joi = require('joi')

const uuidRegex = '[0-9a-f]{8}\\b-[0-9a-f]{4}\\b-[0-9a-f]{4}\\b-[0-9a-f]{4}\\b-[0-9a-f]{12}'
const notifyApiKeyRegex = new RegExp(`.*-${uuidRegex}-${uuidRegex}`)

const schema = Joi.object({
  cache: {
    expiresIn: Joi.number().default(1000 * 3600 * 24 * 3),
    options: {
      host: Joi.string().default('redis-hostname.default'),
      partition: Joi.string().default('ffc-ahwr-frontend'),
      password: Joi.string().default('redis'),
      port: Joi.number().default(6379),
      tls: Joi.object().default({})
    }
  },
  cookie: {
    cookieNameAuth: Joi.string().default('ffc_ahwr_auth'),
    cookieNameSession: Joi.string().default('ffc_ahwr_session'),
    isSameSite: Joi.string().default('Lax'),
    isSecure: Joi.boolean().default(true),
    password: Joi.string().min(32).required()
  },
  env: Joi.string().valid('development', 'test', 'production').default('development'),
  isDev: Joi.boolean().default(false),
  notify: {
    apiKey: Joi.string().pattern(notifyApiKeyRegex),
    templateIdApplicationComplete: Joi.string().uuid()
  },
  port: Joi.number().default(3000),
  serviceName: Joi.string().default('Review the health and welfare of your livestock'),
  useRedis: Joi.boolean().default(false)
})

const config = {
  cache: {
    expiresIn: 1000 * 3600 * 24 * 3,
    options: {
      host: process.env.REDIS_HOSTNAME,
      partition: process.env.REDIS_PARTITION ?? 'ffc-ahwr-frontend',
      password: process.env.REDIS_PASSWORD,
      port: process.env.REDIS_PORT,
      tls: process.env.NODE_ENV === 'production' ? {} : undefined
    }
  },
  cookie: {
    cookieNameAuth: 'ffc_ahwr_auth',
    cookieNameSession: 'ffc_ahwr_session',
    isSameSite: 'Lax',
    isSecure: process.env.NODE_ENV === 'production',
    password: process.env.COOKIE_PASSWORD
  },
  env: process.env.NODE_ENV,
  isDev: process.env.NODE_ENV === 'development',
  notify: {
    apiKey: process.env.NOTIFY_API_KEY,
    templateIdApplicationComplete: process.env.NOTIFY_TEMPLATE_ID_APPLICATION_COMPLETE
  },
  port: process.env.PORT,
  serviceName: process.env.SERVICE_NAME,
  useRedis: process.env.NODE_ENV === 'production'
}

const { error, value } = schema.validate(config, { abortEarly: false })

if (error) {
  throw new Error(`The server config is invalid. ${error.message}`)
}

module.exports = value
