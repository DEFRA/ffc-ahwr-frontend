const Joi = require('joi')
const uuidRegex = require('./uuid-regex')
const notifyApiKeyRegex = new RegExp(`.*-${uuidRegex}-${uuidRegex}`)
const msgTypePrefix = 'uk.gov.ffc.ahwr'

const sharedConfigSchema = {
  appInsights: Joi.object(),
  host: Joi.string().default('localhost'),
  password: Joi.string(),
  username: Joi.string(),
  useCredentialChain: Joi.bool().default(false)
}
const schema = Joi.object({
  cache: {
    expiresIn: Joi.number().default(1000 * 3600 * 24 * 3), // 3 days
    options: {
      host: Joi.string().default('redis-hostname.default'),
      partition: Joi.string().default('ffc-ahwr-frontend'),
      password: Joi.string().allow(''),
      port: Joi.number().default(6379),
      tls: Joi.object()
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
    templateIdApplicationComplete: Joi.string().uuid(),
    templateIdFarmerLogin: Joi.string().uuid()
  },
  port: Joi.number().default(3000),
  applicationRequestQueue: {
    address: Joi.string().default('applicationRequestQueue'),
    type: Joi.string(),
    ...sharedConfigSchema
  },
  applicationRequestMsgType: Joi.string(),
  applicationResponseQueue: {
    address: Joi.string().default('applicationResponseQueue'),
    type: Joi.string(),
    ...sharedConfigSchema
  },
  applicationResponseMsgType: Joi.string(),
  serviceUri: Joi.string().uri(),
  storage: {
    connectionString: Joi.string().required(),
    usersContainer: Joi.string().default('users'),
    usersFile: Joi.string().default('users.json')
  },
  useRedis: Joi.boolean().default(false)
})

const sharedConfig = {
  appInsights: require('applicationinsights'),
  host: process.env.MESSAGE_QUEUE_HOST,
  password: process.env.MESSAGE_QUEUE_PASSWORD,
  username: process.env.MESSAGE_QUEUE_USER,
  useCredentialChain: process.env.NODE_ENV === 'production'
}
const config = {
  cache: {
    options: {
      host: process.env.REDIS_HOSTNAME,
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
    templateIdApplicationComplete: process.env.NOTIFY_TEMPLATE_ID_APPLICATION_COMPLETE,
    templateIdFarmerLogin: process.env.NOTIFY_TEMPLATE_ID_FARMER_LOGIN
  },
  port: process.env.PORT,
  applicationRequestQueue: {
    address: process.env.APPLICATIONREQUEST_QUEUE_ADDRESS,
    type: 'queue',
    ...sharedConfig
  },
  applicationRequestMsgType: `${msgTypePrefix}.app.request`,
  applicationResponseQueue: {
    address: process.env.APPLICATIONRESPONSE_QUEUE_ADDRESS,
    type: 'queue',
    ...sharedConfig
  },
  applicationResponseMsgType: `${msgTypePrefix}.app.response`,
  serviceUri: process.env.SERVICE_URI,
  storage: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING
  },
  useRedis: process.env.NODE_ENV !== 'test'
}

const { error, value } = schema.validate(config, { abortEarly: false })

if (error) {
  throw new Error(`The server config is invalid. ${error.message}`)
}

module.exports = value
