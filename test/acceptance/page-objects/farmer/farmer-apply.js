import Page from '../page'

class FarmerApply extends Page {
  get startNow () {  return browser.$('//a[@href=\'/farmer-apply/login\'][contains(.,\'Start now\')]') }
  get title(){ return browser.$('//h1[@class=\'govuk-heading-l\'][contains(.,\'Apply for an annual health and welfare review\')]')}

  open () {
    return super.open('/farmer-apply');
  }
  async clickStartNow () {
    await this.startNow.click()
  }
  async istTitleExist () {
    return await this.title.isDisplayed();
  }
}

module.exports = new FarmerApply()
