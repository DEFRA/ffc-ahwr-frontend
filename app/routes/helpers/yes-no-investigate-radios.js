/**
 * Generate GOV.UK radios component.
 *
 * @param {string} legendText heading text for radios.
 * @param {string} id of the radio component.
 * @param {string} previousAnswer either `yes`, `no` or 'further investigation required' used to set the radio as checked.
 * @param {string} [errorText] error message to display.
 * @param {object} [options] an object containing `isPageHeading` (boolean, determines if the legendText is marked as a heading), `legendClasses` (string, contains classes to add to legendText) and `inline` (boolean determines if the class to make the radios display as inline is added).
 *
 * @return {object} object with `radios` property containing radios component.
 */
function getYesNoInvestigateRadios (legendText, id, previousAnswer, errorText) {
  return {
    radios: {
      classes: 'govuk-radios--inline',
      idPrefix: id,
      name: id,
      fieldset: {
        legend: {
          text: legendText,
          isPageHeading: true,
          classes: 'govuk-fieldset__legend--l'
        }
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
        },
        {
          value: 'further investigation required',
          text: 'Further investigation required',
          checked: previousAnswer === 'further investigation required'
        }
      ],
      ...(errorText ? { errorMessage: { text: errorText } } : {})
    }
  }
}

module.exports = getYesNoInvestigateRadios
