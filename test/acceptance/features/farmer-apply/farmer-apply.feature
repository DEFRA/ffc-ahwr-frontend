Feature: Farmer apply
  @wip
  Scenario: Farmer receives email when signing in
    Given I open the site "/farmer-apply/login"
    Then I expect that the title contains "Sign in - Review the health and welfare of your livestock"
    #Then I expect that the title contains "Review the health and welfare of your livestock - GOV.UK"
    And I expect that element "h1" contains the text "Enter your email address"
    When I click on the button "#submit"

  @wip
  Scenario: Get Login Token
    Given I open the site "/farmer-apply/login"
    When I enter my valid "venkata.gannavarapu@capgemini.com" 
    Given I open the site "/verify-login?token=0f9ecf32-da18-4e17-8a94-c37732d97489&email=venkata.gannavarapu%40capgemini.com"
    Then I expect that the title contains "Check your details"
    When I select yes option from farmer review
    And I select beef cattle from which review
    And I select yes option from farmer eligibility
    And I select confirm from check your answers

    
    