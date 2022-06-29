import BrowserstackService from "@wdio/browserstack-service";
import {When, Then} from "@wdio/cucumber-framework";
import FarmerCattleEligibility from '../../page-objects/farmer-cattle-eligibility';


When("I select yes option from farmer eligibility", async () => {
        await FarmerCattleEligibility.selectCattleYes();
        await FarmerCattleEligibility.clickContinue();
        await browser.pause(2000)
    });