Feature: Farmer apply
  @wip
  Scenario: Farmer applies for token
#    Given I am on the landing page
#    Then I click on farmer Apply
    Then I click on startNow
    When I enter my valid "livsey-erubamie.williams@capgemini.com"

 @wip
  Scenario: Farmer completes application
     Given farmer clicks on email link "15be7dfe-31da-42e8-88f9-d136225f4555" "livsey-erubamie.williams@capgemini.com"
     When I select yes my details are correct on farmer review page
     Then I select beef cattle on the livestock review page
     Then I select yes option from farmer eligibility
     Then I select confirm from check your answers
     And I check the terms and condition checkbox and click submit application
#    #When I enter my valid "venkata.gannavarapu@capgemini.com"
#    Given I open the site "/verify-login?token=0f9ecf32-da18-4e17-8a94-c37732d97489&email=livsey-erubamie.williams@capgemini.com"
#    #Then I expect that the title contains "Check your details"
#    When I select yes my details are correct on farmer review page
#    And I select beef cattle on the livestock review page
#    And I select yes option from farmer eligibility
#    And I select confirm from check your answers
#    #And I check the terms and condition checkbox and click submit application



