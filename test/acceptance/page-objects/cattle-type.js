import Page from './page'

class CattleType extends Page {
  get beefRadioButton () { return $('#cattle-type') }
  get dairyRadioButton () { return $('#cattle-type-2') }
  get bothRadioButton () { return $('#cattle-type-4') }
  get headerTitle () { return $('.govuk-fieldset__heading') }
  get continue () { return $('#btnContinue') }

  open () {
    super.open('')
    browser.pause(3000)
  }

  async selectBeef () {
    await (await this.beefRadioButton).click()
  }

  async selectDairy () {
    await (await this.dairyRadioButton).click()
  }

  async selectBoth () {
    await (await this.bothRadioButton).click()
  }

  async verifyHeaderTitle () {
    await this.headerTitle.getText()
  }

  async clickContinue () {
    await (await this.continue).click()
  }
}

export default new CattleType()

