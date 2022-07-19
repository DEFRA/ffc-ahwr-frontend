Feature: Mandatory pages
  Scenario: Accessibility page
    Given I open the site "/accessibility"
    Then I expect that the title contains "Accessibility statement -"
    And I expect that element "h1" contains the text "Accessibility statement for Review the health and welfare of your livestock service"
    And I expect "accessibility" to pass axe a11y checks

  Scenario: Cookie page
    Given I open the site "/cookies"
    Then I expect that the title contains "Cookies -"
    And I expect that element "h1" contains the text "Cookies on Review the health and welfare of your livestock service"
    And I expect "cookies" to pass axe a11y checks

  Scenario: Privacy policy page
    Given I open the site "/privacy-policy"
    Then I expect that the title contains "Privacy policy -"
    And I expect that element "h1" contains the text "Privacy policy statement for Review the health and welfare of your livestock service"
    And I expect "privacy policy" to pass axe a11y checks