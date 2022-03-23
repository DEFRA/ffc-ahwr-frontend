const downloadBlob = require('../lib/download-blob')
const { storage: { connectionString, usersContainer, usersFile } } = require('../config')

async function getByEmail (email) {
  return (await getOrgs()).find(x => x.email === email)
}

async function getOrgs () {
  const contents = await downloadBlob(connectionString, usersContainer, usersFile) ?? '[]'
  return JSON.parse(contents)
}

module.exports = {
  getByEmail,
  getOrgs
}
