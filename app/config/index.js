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
    cookieNameCookiePolicy: Joi.string().default('ffc_ahwr_cookie_policy'),
    cookieNameAuth: Joi.string().default('ffc_ahwr_auth'),
    cookieNameSession: Joi.string().default('ffc_ahwr_session'),
    isSameSite: Joi.string().default('Lax'),
    isSecure: Joi.boolean().default(true),
    password: Joi.string().min(32).required(),
    ttl: Joi.number().default(1000 * 3600 * 24 * 3) // 3 days
  },
  cookiePolicy: {
    clearInvalid: Joi.bool().default(false),
    encoding: Joi.string().valid('base64json').default('base64json'),
    isSameSite: Joi.string().default('Lax'),
    isSecure: Joi.bool().default(true),
    password: Joi.string().min(32).required(),
    path: Joi.string().default('/'),
    ttl: Joi.number().default(1000 * 60 * 60 * 24 * 365) // 1 year
  },
  env: Joi.string().valid('development', 'test', 'production').default(
    'development'
  ),
  googleTagManagerKey: Joi.string().allow(null, ''),
  isDev: Joi.boolean().default(false),
  notify: {
    apiKey: Joi.string().pattern(notifyApiKeyRegex),
    templateIdFarmerApplyLogin: Joi.string().uuid(),
    templateIdFarmerClaimLogin: Joi.string().uuid(),
    templateIdVetLogin: Joi.string().uuid()
  },
  port: Joi.number().default(3000),
  serviceName: Joi.string().default('Annual health and welfare review of livestock'
  ),
  journeys: {
    farmerApply: { title: Joi.string() },
    farmerClaim: { title: Joi.string() },
    vet: { title: Joi.string() }
  },
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
  fetchApplicationRequestMsgType: Joi.string(),
  fetchClaimRequestMsgType: Joi.string(),
  submitClaimRequestMsgType: Joi.string(),
  vetVisitRequestMsgType: Joi.string(),
  serviceUri: Joi.string().uri(),
  storage: {
    connectionString: Joi.string().required(),
    usersContainer: Joi.string().default('users'),
    usersFile: Joi.string().default('users.json'),
    storageAccount: Joi.string().required(),
    useConnectionString: Joi.bool().default(true)
  },
  useRedis: Joi.boolean().default(false),
  testToken: Joi.string().uuid().optional()
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
    cookieNameCookiePolicy: 'ffc_ahwr_cookie_policy',
    cookieNameAuth: 'ffc_ahwr_auth',
    cookieNameSession: 'ffc_ahwr_session',
    isSameSite: 'Lax',
    isSecure: process.env.NODE_ENV === 'production',
    password: process.env.COOKIE_PASSWORD
  },
  cookiePolicy: {
    clearInvalid: false,
    encoding: 'base64json',
    isSameSite: 'Lax',
    isSecure: process.env.NODE_ENV === 'production',
    password: process.env.COOKIE_PASSWORD
  },
  env: process.env.NODE_ENV,
  googleTagManagerKey: process.env.GOOGLE_TAG_MANAGER_KEY,
  isDev: process.env.NODE_ENV === 'development',
  notify: {
    apiKey: process.env.NOTIFY_API_KEY,
    templateIdFarmerApplyLogin:
      process.env.NOTIFY_TEMPLATE_ID_FARMER_APPLY_LOGIN,
    templateIdFarmerClaimLogin:
      process.env.NOTIFY_TEMPLATE_ID_FARMER_CLAIM_LOGIN,
    templateIdVetLogin: process.env.NOTIFY_TEMPLATE_ID_VET_LOGIN
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
  fetchApplicationRequestMsgType: `${msgTypePrefix}.fetch.app.request`,
  fetchClaimRequestMsgType: `${msgTypePrefix}.fetch.claim.request`,
  submitClaimRequestMsgType: `${msgTypePrefix}.submit.claim.request`,
  vetVisitRequestMsgType: `${msgTypePrefix}.vet.visit.request`,
  serviceUri: process.env.SERVICE_URI,
  storage: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    useConnectionString: process.env.AZURE_STORAGE_USE_CONNECTION_STRING,
    storageAccount: process.env.AZURE_STORAGE_ACCOUNT_NAME
  },
  useRedis: process.env.NODE_ENV !== 'test',
  journeys: {
    farmerApply: {
      title: 'Annual health and welfare review of your livestock'
    },
    farmerClaim: {
      title:
        'Annual health and welfare review of your livestock'
    },
    vet: {
      title:
        'Annual health and welfare review of livestock'
    }
  },
  testToken: process.env.TEST_TOKEN
}

const { error, value } = schema.validate(config, { abortEarly: false })

if (error) {
  throw new Error(`The server config is invalid. ${error.message}`)
}

module.exports = value
