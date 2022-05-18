import Page from './page'

class Cattle extends Page {
  get yesRadioButton () { return $('#cattle') }
  get noRadioButton () { return $('#cattle-2') }
  get headerTitle () { return $('.govuk-fieldset__heading') }
  get continue () { return $('#btnContinue') }

  open () {
    super.open('')
    browser.pause(3000)
  }

  async selectCattleYes () {
    await (await this.yesRadioButton).click()
  }

  async selectCattleNo () {
    await (await this.noRadioButton).click()
  }

  async verifyHeaderTitle () {
    await this.headerTitle.getText()
  }

  async clickContinue () {
    await (await this.continue).click()
  }
}

export default new Cattle()
