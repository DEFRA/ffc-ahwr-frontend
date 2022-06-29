import BrowserstackService from "@wdio/browserstack-service";
import {When, Then} from "@wdio/cucumber-framework";
//import loginPage from '../../page-objects/farmer-login'
import FarmerReview from '../../page-objects/farmer-org-review'

When("I select yes option from farmer review", async () => {
        await FarmerReview.selectYes();
        await FarmerReview.clickContinue();
        await browser.pause(5000)
    });