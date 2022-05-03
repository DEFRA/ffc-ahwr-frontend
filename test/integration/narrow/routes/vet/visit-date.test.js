const cheerio = require('cheerio')
const getCrumbs = require('../../../../utils/get-crumbs')
const expectPhaseBanner = require('../../../../utils/phase-banner-expect')
const { inputErrorClass, labels } = require('../../../../../app/config/visit-date')
const { vetVisitData: { farmerApplication } } = require('../../../../../app/session/keys')

function expectPageContentOk ($) {
  expect($('h1').text()).toMatch('When did the review take place with the farmer?')
  expect($(`label[for=${labels.day}]`).text()).toMatch('Day')
  expect($(`label[for=${labels.month}]`).text()).toMatch('Month')
  expect($(`label[for=${labels.year}]`).text()).toMatch('Year')
  expect($('.govuk-button').text()).toMatch('Continue')
  expect($('title').text()).toEqual('Enter the date of the visit')
  expect($('.govuk-back-link').length).toEqual(0)
}

const session = require('../../../../../app/session')
jest.mock('../../../../../app/session')

describe('Vet, enter date of visit', () => {
  const auth = { credentials: {}, strategy: 'cookie' }
  const url = '/vet/visit-date'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe(`GET ${url} route`, () => {
    test('returns 302 and redirects to /vet when not logged in', async () => {
      const options = {
        method: 'GET',
        url
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet')
    })

    test('returns 200 when logged in', async () => {
      const options = {
        method: 'GET',
        url,
        auth
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expectPageContentOk($)
      expectPhaseBanner.ok($)
    })

    test('loads input dates, if in session', async () => {
      const date = new Date()
      const options = {
        method: 'GET',
        url,
        auth
      }
      session.getVetVisitData.mockReturnValue(date)

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expectPageContentOk($)
      expectPhaseBanner.ok($)
      expect($(`#${labels.day}`).val()).toEqual(date.getDate().toString())
      expect($(`#${labels.month}`).val()).toEqual((date.getMonth() + 1).toString())
      expect($(`#${labels.year}`).val()).toEqual(date.getFullYear().toString())
    })
  })

  describe(`POST to ${url} route`, () => {
    let crumb
    const method = 'POST'
    const today = new Date()
    const yearPastMinusOneApplicationDate = new Date(today)
    yearPastMinusOneApplicationDate.setFullYear(yearPastMinusOneApplicationDate.getFullYear() - 1)
    yearPastMinusOneApplicationDate.setDate(yearPastMinusOneApplicationDate.getDate() - 1)
    const yearPast = new Date(today)
    yearPast.setDate(yearPast.getDate() - 365)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    beforeEach(async () => {
      crumb = await getCrumbs(global.__SERVER__)
    })

    test('when not logged in redirects to /vet', async () => {
      const options = {
        method,
        url,
        payload: { crumb, [labels.day]: 31, [labels.month]: 12, [labels.year]: 2022 },
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet')
    })

    const allErrorHighlights = [labels.day, labels.month, labels.year]

    test.each([
      { description: 'visit 366 days after application created', day: today.getDate(), month: today.getMonth() + 1, year: today.getFullYear(), errorMessage: `Visit date must be the same as or after ${yearPastMinusOneApplicationDate.toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, errorHighlights: allErrorHighlights, applicationCreationDate: yearPastMinusOneApplicationDate },
      { description: 'visit in future - application created yesterday, visit date tomorrow', day: tomorrow.getDate(), month: tomorrow.getMonth() + 1, year: tomorrow.getFullYear(), errorMessage: 'Visit date must be today or in the past', errorHighlights: allErrorHighlights, applicationCreationDate: yesterday },
      { description: 'visit before application - application created today, visit date yesterday', day: yesterday.getDate(), month: yesterday.getMonth() + 1, year: yesterday.getFullYear(), errorMessage: `Visit date must be the same as or after ${today.toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, errorHighlights: allErrorHighlights, applicationCreationDate: today },
      { description: 'missing day and month and year', day: '', month: '', year: '', errorMessage: 'Enter the date of the visit', errorHighlights: allErrorHighlights, applicationCreationDate: today },
      { description: 'missing day', day: '', month: today.getMonth(), year: today.getFullYear(), errorMessage: 'Visit date must include a day', errorHighlights: [labels.day], applicationCreationDate: today },
      { description: 'missing month', day: today.getDate(), month: '', year: today.getFullYear(), errorMessage: 'Visit date must include a month', errorHighlights: [labels.month], applicationCreationDate: today },
      { description: 'missing year', day: today.getDate(), month: today.getMonth(), year: '', errorMessage: 'Visit date must include a year', errorHighlights: [labels.year], applicationCreationDate: today },
      { description: 'missing day and month', day: '', month: '', year: today.getFullYear(), errorMessage: 'Visit date must include a day and a month', errorHighlights: [labels.day, labels.month], applicationCreationDate: today },
      { description: 'missing day and year', day: '', month: today.getMonth(), year: '', errorMessage: 'Visit date must include a day and a year', errorHighlights: [labels.day, labels.year], applicationCreationDate: today },
      { description: 'missing month and year', day: today.getDate(), month: '', year: '', errorMessage: 'Visit date must include a month and a year', errorHighlights: [labels.month, labels.year], applicationCreationDate: today }
    ])('returns error ($errorMessage) when partial or invalid input is given - $description', async ({ day, month, year, errorMessage, errorHighlights, applicationCreationDate }) => {
      session.getVetVisitData.mockReturnValueOnce({ createdAt: applicationCreationDate })
      const options = {
        method,
        url,
        payload: { crumb, [labels.day]: day, [labels.month]: month, [labels.year]: year },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      const $ = cheerio.load(res.payload)
      expect(res.statusCode).toBe(400)
      expect($('p.govuk-error-message').text()).toMatch(errorMessage)
      errorHighlights.forEach(label => {
        expect($(`#${label}`).hasClass(inputErrorClass)).toEqual(true)
      })
      expect(session.getVetVisitData).toHaveBeenCalledTimes(1)
      expect(session.getVetVisitData).toHaveBeenCalledWith(res.request, farmerApplication)
    })

    test.each([
      { description: 'application created today, visit date today', applicationCreationDate: today },
      { description: 'application created 365 days ago, visit date today', applicationCreationDate: yearPast },
      { description: 'application created yesterday, visit date today', applicationCreationDate: yesterday }
    ])('returns 302 to next page when acceptable answer given - $description', async ({ applicationCreationDate }) => {
      session.getVetVisitData.mockReturnValueOnce({ createdAt: applicationCreationDate })
      const options = {
        method,
        url,
        payload: { crumb, [labels.day]: today.getDate(), [labels.month]: today.getMonth() + 1, [labels.year]: today.getFullYear() },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet/check-answers')
      expect(session.getVetVisitData).toHaveBeenCalledTimes(1)
      expect(session.getVetVisitData).toHaveBeenCalledWith(res.request, farmerApplication)
    })
  })
})
