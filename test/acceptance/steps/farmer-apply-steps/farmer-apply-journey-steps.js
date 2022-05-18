import {When, Then} from "@wdio/cucumber-framework";
//import loginPage from '../../page-objects/farmer-login'
import FarmerLogin from '../../page-objects/farmer-login'

When("I enter my valid {string}", async function (email) {
    await FarmerLogin.enterEmail(email)
    await FarmerLogin.clickSignin()
});