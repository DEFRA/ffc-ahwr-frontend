Feature: Mandatory pages
  Scenario: Cookie page
    Given I open the site "/cookies"
    Then I expect that the title contains "Cookies -"
    And I expect that element "h1" contains the text "Cookies on Review the health and welfare of your livestock service"
