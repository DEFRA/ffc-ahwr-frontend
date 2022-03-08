const { cacheKeys } = require('../../config/constants')

const set = (request, entryKey, key, value) => {
  const entryValue = request.yar?.get(entryKey) || {}
  entryValue[key] = value
  request.yar.set(entryKey, entryValue)
}

const get = (request, entryKey, key) => key ? request.yar?.get(entryKey)?.[key] : request.yar?.get(entryKey)

module.exports = {
  setApplication: (request, key, value) => set(request, cacheKeys.application, key, value),
  getApplication: (request, key) => get(request, cacheKeys.application, key),
  getOrganisation: (request, key) => get(request, cacheKeys.org, key)
}
