const entries = {
  application: 'application',
  organisation: 'organisation'
}

function set (request, entryKey, key, value) {
  const entryValue = request.yar?.get(entryKey) || {}
  entryValue[key] = value
  request.yar.set(entryKey, entryValue)
}

function get (request, entryKey, key) {
  return key ? request.yar?.get(entryKey)?.[key] : request.yar?.get(entryKey)
}

function setApplication (request, key, value) {
  set(request, entries.application, key, value)
}

function setOrganisation (request, key, value) {
  set(request, entries.organisation, key, value)
}

function getApplication (request, key) {
  return get(request, entries.application, key)
}

function getOrganisation (request, key) {
  return get(request, entries.organisation, key)
}

module.exports = {
  setApplication,
  setOrganisation,
  getApplication,
  getOrganisation
}
