const downloadBlob = require('../lib/download-blob')
const { storage: { connectionString, usersContainer, usersFile } } = require('../config')

async function getUsers () {
  const contents = await downloadBlob(connectionString, usersContainer, usersFile) ?? '[]'
  return JSON.parse(contents)
}

async function getByEmail (email) {
  return (await getUsers()).find(x => x.email === email)
}

module.exports = {
  getByEmail
}
