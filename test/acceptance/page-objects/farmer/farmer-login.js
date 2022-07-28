import Page from '../page'

class FarmerLogin extends Page {
  get email () { return $('#email') }
  get signin () { return $('#submit') }

  open () {
    super.open('')
    browser.pause(3000)
  }

  async enterEmail (email) {
    await (await this.email).setValue(email)
  }

  async clickSignin () {
    await (await this.signin).click()
  }
}

module.exports = new FarmerLogin()
