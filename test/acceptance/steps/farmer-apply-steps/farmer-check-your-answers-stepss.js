import BrowserstackService from "@wdio/browserstack-service";
import {When, Then} from "@wdio/cucumber-framework";
import CheckAnswer from '../../page-objects/check-answer';


When("I select confirm from check your answers", async () => {
        await CheckAnswer.clickContinue();
        await browser.pause(10000)
    });