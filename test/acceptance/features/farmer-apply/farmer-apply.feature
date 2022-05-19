Feature: Farmer apply
  @wip
  Scenario: Farmer receives email when signing in
    Given I open the site "/farmer-apply/login"
    Then I expect that the title contains "Sign in - Review the health and welfare of your livestock"
    And I expect that element "h1" contains the text "Enter your email address"
    When I click on the button "#submit"
