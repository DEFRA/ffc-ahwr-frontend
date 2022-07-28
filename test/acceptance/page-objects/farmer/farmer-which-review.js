import Page from '../page'

class WhichReview extends Page {
  get beefRadioButton () { return browser.$('#whichReview') }
  get dairyRadioButton () { return browser.$('#whichReview-2') }
  get sheepRadioButton () { return browser.$('#whichReview-3') }
  get pigRadioButton () { return browser.$('#whichReview-4') }
  get headerTitle () { return browser.$('.govuk-fieldset__heading') }

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


}

module.exports =  new WhichReview()

