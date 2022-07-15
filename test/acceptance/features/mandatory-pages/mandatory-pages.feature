Feature: Mandatory pages
  Scenario: Cookie page
    Given I open the site "/cookies"
    Then I expect that the title contains "Details about cookies - Annual health and welfare review of livestock"
    And I expect that element "h1" contains the text "Details about cookies on Annual health and welfare review of livestock service"
