function getYesNoRadios (legendText, id, previousAnswer, errorText) {
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
        }
      ],
      ...(errorText ? { errorMessage: { text: errorText } } : {})
    }
  }
}

module.exports = getYesNoRadios
