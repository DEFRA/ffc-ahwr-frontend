const lookupErrorText = require('./lookup-error-text')

const getErrorMessage = (object) => {
  return lookupErrorText(object[Object.keys(object)[0]])
}

const errorExtractor = (data) => {
  const { details } = data
  const errorObject = {}

  details.forEach((detail) => {
    if (detail.path.length > 0) {
      const errorKey = detail.path.join().replace(/,/gi, '.')
      errorObject[errorKey] = `error.${errorKey}.${detail.type}`
    } else if (detail.context.label) {
      errorObject[detail.context.label] = `error.${detail.context.label}.${detail.type}`
    }
  })

  return errorObject
}

module.exports = {
  getErrorMessage,
  errorExtractor
}