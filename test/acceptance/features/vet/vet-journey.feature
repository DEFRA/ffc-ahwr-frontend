Feature: Vet journey
  @wip
  Scenario: Vet receives email when signing in
    Given I open the site "/vet/login"
    Then I expect that the title contains "Sign in - Review the health and welfare of your livestock"
    And I expect that element "h1" contains the text "Sign in with your email address"
    When I click on the button "#submit"
