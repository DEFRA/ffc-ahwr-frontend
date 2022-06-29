import Page from './page'

class Sheep extends Page {
  get yesRadioButton () { return $('#sheep') }
  get noRadioButton () { return $('#sheep-2') }
  get headerTitle () { return $('.govuk-fieldset__heading') }
  get continue () { return $('#btnContinue') }

  open () {
    super.open('')
    browser.pause(3000)
  }

  async selectSheepYes () {
    await (await this.yesRadioButton).click()
  }

  async selectSheepNo () {
    await (await this.noRadioButton).click()
  }

  async verifyHeaderTitle () {
    await this.headerTitle.getText()
  }

  async clickContinue () {
    await (await this.continue).click()
  }
}

export default new Sheep()
