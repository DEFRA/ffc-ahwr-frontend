import Page from './page'

class FarmerOrgReview extends Page {
  get continue () { return $('##btnContinue') }
  get orgReviewQuestion () { return $('.govuk-form-group legend') }
  get orgYesRadioOption () { return $('.govuk-form-group #confirmCheckDetails') }
  get orgNoRadioOption () { return $('.govuk-form-group #confirmCheckDetails-2') }

  open () {
    super.open('')
    browser.pause(3000)
  }

  async getOrgReviewQuestion () {
    await this.orgReviewQuestion.getText()
  }

  async selectYes () {
    await this.orgYesRadioOption.click()
  }

  async selectNo () {
    await this.orgNoRadioOption.click()
  }

  async clickContinue () {
    await this.continue.click()
  }

}

export default new FarmerOrgReview()
