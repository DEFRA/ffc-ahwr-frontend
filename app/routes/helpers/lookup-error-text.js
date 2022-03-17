const errors = {
  'error.sheep.any.required': 'Select yes if you keep more than 20 sheep',
  'error.pigs.any.required': 'Select yes if you keep more than 50 pigs',
  'error.cattle.any.required': 'Select yes if you keep more than 10 cattle',
}
const lookupErrorText = (key) => {
  return errors[key] || key
}

module.exports = lookupErrorText