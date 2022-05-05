import Page from './page'

class FarmerOrgReview extends Page {
  //Health and welfare review funding for this organisation
//Venkata's Farm
//SBI number:	777777777
//CPH number:	77/777/7777
//Address:	Address line 1, Addres line 2, Town, AB12 34CD
//Contact email address:	venkata.gannavarapu@capgemini.com
//If your email is not correct, update your email address at Rural Payments
  get header () { return $('#main-content h1') }
  get orgName () { return $('#main-content h2') }
  get start () { return $('#main-content a') }

  open () {
    super.open('')
    browser.pause(3000)
  }

  async getHeader () {
    await this.header.getText()
  }

  async getOrgName () {
    await this.orgName.getText()
  }

  async clickSignin () {
    await this.start.click()
  }

}

export default new FarmerOrgReview()
