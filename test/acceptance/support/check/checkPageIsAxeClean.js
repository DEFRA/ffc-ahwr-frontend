const fs = require('fs');
const AxeBuilder = require('@axe-core/webdriverjs');
const WebDriver = require('selenium-webdriver');
const Reporter = require('@axe-core/webdriverjs').reporter;

/**
 * Check that the current page passes axe accessibility audit
 * @param  {String}   pageName     The name of the page we are testing
 */
export default async pageName => {
  const driver = new WebDriver.Builder().forBrowser('chrome').build();
  const axeDriver = await new AxeBuilder(driver, "wcag2");
  const outputDir = `./a11y_results_${pageName}`;

  //remove previous axe devtools output files
  fs.rmdir(outputDir, { recursive: true });

  //initialize reporter
  // const reporter = new Reporter('webdriverjs', './a11y_results')
  // const reporter = new axeDriver.reporter('webdriverjs', './a11y_results')

  await axeDriver.analyze((err, results) => {

    if (err) {
      // Handle error
    }

    // reporter.logTestResult(`${pageName}`, results);
    // reporter.buildHTML(outputDir);

    assert.strictEqual(results.violations.length, 0);
  });
}
