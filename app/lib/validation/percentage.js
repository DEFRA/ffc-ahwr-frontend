const Joi = require('joi')
const { epgPercentage: epgErrorMessages } = require('../error-messages')

module.exports = {
  epg: Joi.number().min(0).max(100).required()
    .messages({
      'number.required': epgErrorMessages.enterEpg,
      'number.base': epgErrorMessages.validEpg,
      'number.max': 'EPG percentage must be 100 or less',
      'number.min': 'EPG percentage must be 0 or more'
    })
}
