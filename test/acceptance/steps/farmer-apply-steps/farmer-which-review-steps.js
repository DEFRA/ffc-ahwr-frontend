import BrowserstackService from "@wdio/browserstack-service";
import {When, Then} from "@wdio/cucumber-framework";
import whichReview from '../../page-objects/which-review';


When("I select beef cattle from which review", async () => {
        await whichReview.selectBeef();
        await whichReview.clickContinue();
        await browser.pause(2000)
    });