import Page from './page'

class FarmerOrgReview extends Page {
  get continue () { return $('#btnContinue') }
  get orgReviewQuestion () { return $('.govuk-form-group legend') }
  get orgYesRadioOption () { return $('#confirmCheckDetails') }
  get orgNoRadioOption () { return $('#confirmCheckDetails-2') }

  open () {
    super.open('')
    browser.pause(3000)
  }

  async getOrgReviewQuestion () {
    await this.orgReviewQuestion.getText()
  }

  async selectYes () {
    await this.orgYesRadioOption.scrollIntoView();
    await browser.pause(3000);
    await await(this.orgYesRadioOption).click()
  }

  async selectNo () {
    await this.orgNoRadioOption.click()
    await browser.pause(3000);
    await await(this.orgNoRadioOption).click()
  }

  async clickContinue () {
    await await(this.continue).click()
  }

}

export default new FarmerOrgReview()
