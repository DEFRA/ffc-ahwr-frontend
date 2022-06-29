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
<<<<<<< HEAD
    await this.orgYesRadioOption.scrollIntoView();
    await browser.pause(3000);
    await await(this.orgYesRadioOption).click()
=======
    await this.orgYesRadioOption.click()
>>>>>>> ae95057165ccc31e78da1f10651cc68a37c7f3b6
  }

  async selectNo () {
    await this.orgNoRadioOption.click()
<<<<<<< HEAD
    await browser.pause(3000);
    await await(this.orgNoRadioOption).click()
  }

  async clickContinue () {
    await await(this.continue).click()
=======
  }

  async clickContinue () {
    await this.continue.click()
>>>>>>> ae95057165ccc31e78da1f10651cc68a37c7f3b6
  }

}

export default new FarmerOrgReview()
