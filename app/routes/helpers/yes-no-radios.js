/**
 * Generate GOV.UK radios component.
 *
 * @param {string} legendText heading text for radios.
 * @param {string} id of the radio component.
 * @param {string} previousAnswer either `yes` or `no`, used to set the radio as checked.
 * @param {string} [errorText] error message to display.
 * @param {object} [options] an object containing `isPageHeading` (boolean, determines if the legendText is marked as a heading), `legendClasses` (string, contains classes to add to legendText) and `inline` (boolean determines if the class to make the radios display as inline is added).
 *
 * @return {object} object with `radios` property containing radios component.
 */
function getYesNoRadios (legendText, id, previousAnswer, errorText = undefined, options = { isPageHeading: true, legendClasses: 'govuk-fieldset__legend--l', inline: true }, hintText = '') {
  const { inline, isPageHeading, legendClasses } = options
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
        text: hintText
      },
      items: [
        {
          value: 'yes',
          text: 'Yes',
          checked: previousAnswer === 'yes'
        },
        {
          value: 'no',
          text: 'No',
          checked: previousAnswer === 'no'
        }
      ],
      ...(errorText ? { errorMessage: { text: errorText } } : {})
    }
  }
}

module.exports = {
  getYesNoRadios
}
