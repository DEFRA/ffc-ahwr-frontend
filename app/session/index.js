const entries = {
  application: 'application',
  organisation: 'organisation'
}

const set = (request, entryKey, key, value) => {
  const entryValue = request.yar?.get(entryKey) || {}
  entryValue[key] = value
  request.yar.set(entryKey, entryValue)
}

const get = (request, entryKey, key) => key ? request.yar?.get(entryKey)?.[key] : request.yar?.get(entryKey)

module.exports = {
  setApplication: (request, key, value) => set(request, entries.application, key, value),
  setOrganisation: (request, key, value) => set(request, entries.organisation, key, value),
  getApplication: (request, key) => get(request, entries.application, key),
  getOrganisation: (request, key) => get(request, entries.organisation, key)
}
