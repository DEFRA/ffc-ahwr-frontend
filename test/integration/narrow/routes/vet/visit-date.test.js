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
      const items = [{ name: 'day', value: 31 }, { name: 'month', value: 12 }, { name: 'year', value: 2022 }]
      const options = {
        method: 'GET',
        url,
        auth
      }
      session.getVetVisitData.mockReturnValue(items)

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(200)
      const $ = cheerio.load(res.payload)
      expectPageContentOk($)
      expectPhaseBanner.ok($)
      expect($(`#${labels.day}`).val()).toEqual(items[0].value.toString())
      expect($(`#${labels.month}`).val()).toEqual(items[1].value.toString())
      expect($(`#${labels.year}`).val()).toEqual(items[2].value.toString())
    })
  })

  describe(`POST to ${url} route`, () => {
    let crumb
    const method = 'POST'
    const today = new Date()
    const yearFuture = new Date()
    yearFuture.setFullYear(yearFuture.getFullYear() + 1)
    const yearPast = new Date()
    yearPast.setFullYear(yearPast.getFullYear() - 1)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const createdAt = Date.now()
    const startDate = new Date(createdAt)
    const dayBeforeStartDate = new Date(startDate)
    dayBeforeStartDate.setDate(dayBeforeStartDate.getDate() - 1)

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

    test.each([
      { day: '', month: '', year: '', date: '', errorMessage: 'Enter the date of the visit', errorHighlights: [labels.day, labels.month, labels.year] },
      { day: tomorrow.getDate(), month: tomorrow.getMonth() + 1, year: tomorrow.getFullYear(), date: tomorrow, errorMessage: 'Visit date must be today or in the past', errorHighlights: [labels.day, labels.month, labels.year] },
      { day: yearFuture.getDate(), month: yearFuture.getMonth() + 1, year: yearFuture.getFullYear(), date: yearFuture, errorMessage: 'Visit date must be today or in the past', errorHighlights: [labels.day, labels.month, labels.year] },
      { day: yearPast.getDate(), month: yearPast.getMonth() + 1, year: yearPast.getFullYear(), date: yearPast, errorMessage: `Visit date must be the same as or after ${startDate.toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, errorHighlights: [labels.day, labels.month, labels.year] },
      { day: dayBeforeStartDate.getDate(), month: dayBeforeStartDate.getMonth() + 1, year: dayBeforeStartDate.getFullYear(), date: tomorrow, errorMessage: `Visit date must be the same as or after ${startDate.toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, errorHighlights: [labels.day, labels.month, labels.year] },
      { day: '', month: startDate.getMonth(), year: startDate.getFullYear(), errorMessage: 'Visit date must include a day', errorHighlights: [labels.day] },
      { day: startDate.getDate(), month: '', year: startDate.getFullYear(), errorMessage: 'Visit date must include a month', errorHighlights: [labels.month] },
      { day: startDate.getDate(), month: startDate.getMonth(), year: '', errorMessage: 'Visit date must include a year', errorHighlights: [labels.year] },
      { day: '', month: '', year: startDate.getFullYear(), errorMessage: 'Visit date must include a day and a month', errorHighlights: [labels.day, labels.month] },
      { day: '', month: startDate.getMonth(), year: '', errorMessage: 'Visit date must include a day and a year', errorHighlights: [labels.day, labels.year] },
      { day: startDate.getDate(), month: '', year: '', errorMessage: 'Visit date must include a month and a year', errorHighlights: [labels.month, labels.year] }
    ])('returns error ($errorMessage) when partial input is given - $description', async ({ day, month, year, errorMessage, errorHighlights }) => {
      session.getVetVisitData.mockReturnValueOnce({ createdAt: startDate })
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
      { day: today.getDate(), month: today.getMonth() + 1, year: today.getFullYear(), description: 'today', date: today },
      { day: startDate.getDate(), month: startDate.getMonth() + 1, year: startDate.getFullYear(), description: 'first possible date', date: startDate }
    ])('returns 302 to next page when acceptable answer given - $description ($date)', async ({ day, month, year }) => {
      session.getVetVisitData.mockReturnValueOnce({ createdAt: yesterday })
      const options = {
        method,
        url,
        payload: { crumb, [labels.day]: day, [labels.month]: month, [labels.year]: year },
        auth,
        headers: { cookie: `crumb=${crumb}` }
      }

      const res = await global.__SERVER__.inject(options)

      expect(res.statusCode).toBe(302)
      expect(res.headers.location).toEqual('/vet/species')
      expect(session.getVetVisitData).toHaveBeenCalledTimes(1)
      expect(session.getVetVisitData).toHaveBeenCalledWith(res.request, farmerApplication)
    })
  })
})
