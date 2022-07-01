import Page from './page'

class WhichReview extends Page {
  get beefRadioButton () { return $('#whichReview') }
  get dairyRadioButton () { return $('#whichReview-2') }
  get sheepRadioButton () { return $('#whichReview-3') }
  get pigRadioButton () { return $('#whichReview-4') }
  get headerTitle () { return $('.govuk-fieldset__heading') }
  get continue () { return $('#btnContinue') }

  open () {
    super.open('')
    browser.pause(3000)
  }

  async selectBeef () {
    await (await this.beefRadioButton).scrollIntoView();
    await browser.pause(3000); 
    await (await this.beefRadioButton).click()
    await browser.pause(3000); 
  }

  async selectDairy () {
    await (await this.dairyRadioButton).click()
  }

  async selectSheep () {
    await (await this.sheepRadioButton).click()
  }

  async selectPig () {
    await (await this.pigRadioButton).click()
  }

  async verifyHeaderTitle () {
    await this.headerTitle.getText()
  }

  async clickContinue () {
    await (await this.continue).click()
  }
}

export default new WhichReview()

