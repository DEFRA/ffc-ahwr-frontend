import Page from './page'

class FarmerOrgReview extends Page {
  //Health and welfare review funding for this organisation
//Venkata's Farm
//SBI number:	777777777
//CPH number:	77/777/7777
//Address:	Address line 1, Addres line 2, Town, AB12 34CD
//Contact email address:	venkata.gannavarapu@capgemini.com
//If your email is not correct, update your email address at Rural Payments
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
