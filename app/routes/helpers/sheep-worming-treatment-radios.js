const { bz, lv, ml, ad, si } = require('../../constants/sheep-worming-treament-options')

/**
 * Generate GOV.UK radios component.
 *
 * @param {string} legendText heading text for radios.
 * @param {string} id of the radio component.
 * @param {string} previousAnswer one of the vaccinated options.
 * @param {string} [errorText] error message to display.
 * @param {object} [options] an object containing `isPageHeading` (boolean, determines if the legendText is marked as a heading), `legendClasses` (string, contains classes to add to legendText), `inline` (boolean determines if the class to make the radios display as inline is added) and hintHtml (html string to display hint message with the radio button).
 *
 * @return {object} object with `radios` property containing radios component.
 */
function sheepWormingTreamentRadios (legendText, id, previousAnswer, errorText = undefined, options = {}) {
  const { isPageHeading = true, legendClasses = 'govuk-fieldset__legend--l', inline = false, hintHtml = '' } = options
  return {
    radios: {
      classes: inline ? 'govuk-radios--inline' : undefined,
      idPrefix: id,
      name: id,
      fieldset: {
        legend: {
          text: legendText,
          isPageHeading,
          classes: legendClasses
        }
      },
      hint: {
        html: hintHtml
      },
      items: [
        {
          value: bz.value,
          text: bz.text,
          checked: previousAnswer === bz.value
        },
        {
          value: lv.value,
          text: lv.text,
          checked: previousAnswer === lv.value
        },
        {
          value: ml.value,
          text: ml.text,
          checked: previousAnswer === ml.value
        },
        {
          value: ad.value,
          text: ad.text,
          checked: previousAnswer === ad.value
        },
        {
          value: si.value,
          text: si.text,
          checked: previousAnswer === si.value
        }
      ],
      ...(errorText ? { errorMessage: { text: errorText } } : {})
    }
  }
}

module.exports = {
  sheepWormingTreamentRadios
}
