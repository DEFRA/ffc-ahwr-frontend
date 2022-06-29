import Page from './page'

class CheckAnswer extends Page {
  get yesRadioButton () { return $('#pigs') }
  get noRadioButton () { return $('#pigs-2') }
  get headerTitle () { return $('.govuk-fieldset__heading') }
  get confirm () { return $('.govuk-button') }

  open () {
    super.open('')
    browser.pause(3000)
  }

  async selectPigYes () {
    await (await this.yesRadioButton).click()
  }

  async selectPigNo () {
    await (await this.noRadioButton).click()
  }

  async verifyHeaderTitle () {
    await this.headerTitle.getText()
  }

  async clickContinue () {
    await (await this.confirm).click()
    await browser.pause(6000)
  }
}

export default new CheckAnswer()
