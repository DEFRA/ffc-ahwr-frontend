const errors = {
  'error.sheep.any.required': 'Select yes if you keep more than 20 sheep',
}
const lookupErrorText = (key) => {
  return errors[key] || key
}

module.exports = lookupErrorText