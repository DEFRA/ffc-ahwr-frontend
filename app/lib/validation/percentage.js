const Joi = require('joi')
const { epgPercentage: epgErrorMessages } = require('../error-messages')

module.exports = {
  epg: Joi.number().min(0).max(100).required()
    .messages({
      'number.required': epgErrorMessages.enterEpg,
      'number.base': epgErrorMessages.validEpg,
      'number.max': 'Percentage reduction must be 100 or less',
      'number.min': 'Percentage reduction must be 0 or more'
    })
}
