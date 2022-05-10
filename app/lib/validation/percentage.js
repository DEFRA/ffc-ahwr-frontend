const Joi = require('joi')
const { epgPercentage: epgErrorMessages } = require('../error-messages')

module.exports = {
  epg: Joi.number().min(0).max(100).required()
    .messages({
      'any.required': epgErrorMessages.enterEpg,
      'string.epg': epgErrorMessages.validEpg,
      'string.empty': epgErrorMessages.enterEpg
    })
}
