const { sheepWormingTreamentRadios } = require('../../../../../app/routes/helpers/sheep-worming-treatment-radios')

describe('getTreatmentRadios', () => {
  const legendText = 'legendText'
  const id = 'an-id'

  test.each([
    { previousAnswer: 'BZ' },
    { previousAnswer: 'LV' },
    { previousAnswer: 'ML' },
    { previousAnswer: 'AD' },
    { previousAnswer: 'SI' }
  ])('defaults with previousAnswer as $previousAnswer', ({ previousAnswer }) => {
    const res = sheepWormingTreamentRadios(legendText, id, previousAnswer)
    const expectation = {
      radios: {
        idPrefix: id,
        name: id,
        fieldset: {
          legend: {
            text: legendText,
            isPageHeading: true,
            classes: 'govuk-fieldset__legend--l'
          }
        },
        hint: {
          html: ''
        },
        items: [{
          value: 'BZ',
          text: 'BZ',
          checked: previousAnswer === 'BZ'
        },
        {
          value: 'LV',
          text: 'LV',
          checked: previousAnswer === 'LV'
        },
        {
          value: 'ML',
          text: 'ML',
          checked: previousAnswer === 'ML'
        },
        {
          value: 'AD',
          text: 'AD',
          checked: previousAnswer === 'AD'
        },
        {
          value: 'SI',
          text: 'SI',
          checked: previousAnswer === 'SI'
        }]
      }
    }
    expect(res).toEqual(expectation)
    expect(res.radios).not.toHaveProperty('errorMessage')
  })

  test('includes error message when is supplied', () => {
    const errorText = 'error message here'

    const res = sheepWormingTreamentRadios(legendText, id, 'BZ', errorText)

    expect(res.radios.errorMessage).toEqual({ text: errorText })
  })

  test('options are used when supplied', () => {
    const isPageHeading = false
    const legendClasses = 'not-a-real-class'
    const inline = true
    const hintHtml = '<p>hint: Select treatment option</p>'

    const res = sheepWormingTreamentRadios(legendText, id, 'A new value', undefined, { isPageHeading, legendClasses, inline, hintHtml })

    expect(res.radios.classes).toEqual('govuk-radios--inline')
    expect(res.radios.fieldset.legend.classes).toEqual(legendClasses)
    expect(res.radios.fieldset.legend.isPageHeading).toEqual(isPageHeading)
    expect(res.radios.hint.html).toEqual(hintHtml)
  })
})
