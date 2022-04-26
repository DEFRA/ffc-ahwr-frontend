const entries = {
  application: 'application',
  farmerClaim: 'farmerClaim',
  organisation: 'organisation',
  vetSignup: 'vetSignup',
  vetVisitData: 'vetVisitData'
}

function set (request, entryKey, key, value) {
  const entryValue = request.yar?.get(entryKey) || {}
  entryValue[key] = typeof (value) === 'string' ? value.trim() : value
  request.yar.set(entryKey, entryValue)
}

function get (request, entryKey, key) {
  return key ? request.yar?.get(entryKey)?.[key] : request.yar?.get(entryKey)
}

function setApplication (request, key, value) {
  set(request, entries.application, key, value)
}

function setFarmerClaimData (request, key, value) {
  set(request, entries.farmerClaim, key, value)
}

function setOrganisation (request, key, value) {
  set(request, entries.organisation, key, value)
}

function setVetSignup (request, key, value) {
  set(request, entries.vetSignup, key, value)
}

function setVetVisitData (request, key, value) {
  set(request, entries.vetVisitData, key, value)
}

function getApplication (request, key) {
  return get(request, entries.application, key)
}

function getFarmerClaimData (request, key) {
  return get(request, entries.farmerClaim, key)
}

function getOrganisation (request, key) {
  return get(request, entries.organisation, key)
}

function getVetSignup (request, key) {
  return get(request, entries.vetSignup, key)
}

function getVetVisitData (request, key) {
  return get(request, entries.vetVisitData, key)
}

module.exports = {
  getApplication,
  getFarmerClaimData,
  getOrganisation,
  getVetSignup,
  getVetVisitData,
  setApplication,
  setFarmerClaimData,
  setOrganisation,
  setVetSignup,
  setVetVisitData
}
