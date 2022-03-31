const session = require('../../../../app/session')

describe('session', () => {
  const getApplication = 'getApplication'
  const getOrganisation = 'getOrganisation'
  const getVetSignup = 'getVetSignup'
  const setApplication = 'setApplication'
  const setOrganisation = 'setOrganisation'
  const setVetSignup = 'setVetSignup'
  const applicationSectionKey = 'application'
  const organisationSectionKey = 'organisation'
  const vetSignupSectionKey = 'vetSignup'

  const value = 'value'
  const objectValue = { key: value }

  test.each([
    { func: getApplication, expectedSectionKey: applicationSectionKey, key: 'key', value },
    { func: getApplication, expectedSectionKey: applicationSectionKey, key: 'unknown', value: undefined },
    { func: getApplication, expectedSectionKey: applicationSectionKey, key: false, value: objectValue },
    { func: getApplication, expectedSectionKey: applicationSectionKey, key: null, value: objectValue },
    { func: getApplication, expectedSectionKey: applicationSectionKey, key: undefined, value: objectValue },
    { func: getOrganisation, expectedSectionKey: organisationSectionKey, key: 'key', value },
    { func: getOrganisation, expectedSectionKey: organisationSectionKey, key: 'unknown', value: undefined },
    { func: getOrganisation, expectedSectionKey: organisationSectionKey, key: false, value: objectValue },
    { func: getOrganisation, expectedSectionKey: organisationSectionKey, key: null, value: objectValue },
    { func: getOrganisation, expectedSectionKey: organisationSectionKey, key: undefined, value: objectValue },
    { func: getVetSignup, expectedSectionKey: vetSignupSectionKey, key: 'key', value },
    { func: getVetSignup, expectedSectionKey: vetSignupSectionKey, key: 'unknown', value: undefined },
    { func: getVetSignup, expectedSectionKey: vetSignupSectionKey, key: false, value: objectValue },
    { func: getVetSignup, expectedSectionKey: vetSignupSectionKey, key: null, value: objectValue },
    { func: getVetSignup, expectedSectionKey: vetSignupSectionKey, key: undefined, value: objectValue }
  ])('$func retrieves value from $expectedSectionKey based on key (key value - $key)', async ({ func, expectedSectionKey, key, value }) => {
    let sectionKey
    const requestGetMock = { yar: { get: (entryKey) => { sectionKey = entryKey; return objectValue } } }

    const application = session[func](requestGetMock, key)

    expect(application).toEqual(value)
    expect(sectionKey).toEqual(expectedSectionKey)
  })

  test.each([
    { func: setApplication, expectedSectionKey: applicationSectionKey, key: 'key', value },
    { func: setApplication, expectedSectionKey: applicationSectionKey, key: 'unknown', value: undefined },
    { func: setApplication, expectedSectionKey: applicationSectionKey, key: false, value: objectValue },
    { func: setApplication, expectedSectionKey: applicationSectionKey, key: null, value: objectValue },
    { func: setApplication, expectedSectionKey: applicationSectionKey, key: undefined, value: objectValue },
    { func: setOrganisation, expectedSectionKey: organisationSectionKey, key: 'key', value },
    { func: setOrganisation, expectedSectionKey: organisationSectionKey, key: 'unknown', value: undefined },
    { func: setOrganisation, expectedSectionKey: organisationSectionKey, key: false, value: objectValue },
    { func: setOrganisation, expectedSectionKey: organisationSectionKey, key: null, value: objectValue },
    { func: setOrganisation, expectedSectionKey: organisationSectionKey, key: undefined, value: objectValue },
    { func: setVetSignup, expectedSectionKey: vetSignupSectionKey, key: 'key', value },
    { func: setVetSignup, expectedSectionKey: vetSignupSectionKey, key: 'unknown', value: undefined },
    { func: setVetSignup, expectedSectionKey: vetSignupSectionKey, key: false, value: objectValue },
    { func: setVetSignup, expectedSectionKey: vetSignupSectionKey, key: null, value: objectValue },
    { func: setVetSignup, expectedSectionKey: vetSignupSectionKey, key: undefined, value: objectValue }
  ])('$func sets value in $expectedSectionKey based on the key (key value - $key) when no value exists in $expectedSectionKey', async ({ func, expectedSectionKey, key, value }) => {
    const yarMock = {
      get: jest.fn(),
      set: jest.fn()
    }
    const requestSetMock = { yar: yarMock }

    session[func](requestSetMock, key, value)

    expect(requestSetMock.yar.get).toHaveBeenCalledTimes(1)
    expect(requestSetMock.yar.get).toHaveBeenCalledWith(expectedSectionKey)
    expect(requestSetMock.yar.set).toHaveBeenCalledTimes(1)
    expect(requestSetMock.yar.set).toHaveBeenCalledWith(expectedSectionKey, { [key]: value })
  })

  test.each([
    { func: setApplication, expectedSectionKey: applicationSectionKey, key: 'key', value },
    { func: setApplication, expectedSectionKey: applicationSectionKey, key: 'unknown', value: undefined },
    { func: setApplication, expectedSectionKey: applicationSectionKey, key: false, value: objectValue },
    { func: setApplication, expectedSectionKey: applicationSectionKey, key: null, value: objectValue },
    { func: setApplication, expectedSectionKey: applicationSectionKey, key: undefined, value: objectValue },
    { func: setOrganisation, expectedSectionKey: organisationSectionKey, key: 'key', value },
    { func: setOrganisation, expectedSectionKey: organisationSectionKey, key: 'unknown', value: undefined },
    { func: setOrganisation, expectedSectionKey: organisationSectionKey, key: false, value: objectValue },
    { func: setOrganisation, expectedSectionKey: organisationSectionKey, key: null, value: objectValue },
    { func: setOrganisation, expectedSectionKey: organisationSectionKey, key: undefined, value: objectValue },
    { func: setVetSignup, expectedSectionKey: vetSignupSectionKey, key: 'key', value },
    { func: setVetSignup, expectedSectionKey: vetSignupSectionKey, key: 'unknown', value: undefined },
    { func: setVetSignup, expectedSectionKey: vetSignupSectionKey, key: false, value: objectValue },
    { func: setVetSignup, expectedSectionKey: vetSignupSectionKey, key: null, value: objectValue },
    { func: setVetSignup, expectedSectionKey: vetSignupSectionKey, key: undefined, value: objectValue }
  ])('$func sets value in $expectedSectionKey based on the key (key value - $key) when a value already exists in $expectedSectionKey', async ({ func, expectedSectionKey, key, value }) => {
    const existingValue = { existingKey: 'existing-value' }
    const yarMock = {
      get: jest.fn(() => existingValue),
      set: jest.fn()
    }
    const requestSetMock = { yar: yarMock }

    session[func](requestSetMock, key, value)

    expect(requestSetMock.yar.get).toHaveBeenCalledTimes(1)
    expect(requestSetMock.yar.get).toHaveBeenCalledWith(expectedSectionKey)
    expect(requestSetMock.yar.set).toHaveBeenCalledTimes(1)
    expect(requestSetMock.yar.set).toHaveBeenCalledWith(expectedSectionKey, { ...{ [key]: value }, ...existingValue })
  })

  test.each([
    { func: setApplication, expectedSectionKey: applicationSectionKey, key: 'key', value: '    to be trimmed   ' },
    { func: setOrganisation, expectedSectionKey: organisationSectionKey, key: 'key', value: '    to be trimmed   ' },
    { func: setVetSignup, expectedSectionKey: vetSignupSectionKey, key: 'key', value: '    to be trimmed   ' }
  ])('$func sets value once trimmed when the value is a string (value = "$value")', async ({ func, expectedSectionKey, value }) => {
    const key = 'key'
    const yarMock = {
      get: jest.fn(),
      set: jest.fn()
    }
    const requestSetMock = { yar: yarMock }

    session[func](requestSetMock, key, value)

    expect(requestSetMock.yar.get).toHaveBeenCalledTimes(1)
    expect(requestSetMock.yar.get).toHaveBeenCalledWith(expectedSectionKey)
    expect(requestSetMock.yar.set).toHaveBeenCalledTimes(1)
    expect(requestSetMock.yar.set).toHaveBeenCalledWith(expectedSectionKey, { [key]: value.trim() })
  })

  test.each([
    { func: setApplication, expectedSectionKey: applicationSectionKey, key: 'key', value: objectValue },
    { func: setOrganisation, expectedSectionKey: organisationSectionKey, key: 'key', value: objectValue },
    { func: setVetSignup, expectedSectionKey: vetSignupSectionKey, key: 'key', value: objectValue }
  ])('$func does not trim value when the value is not a string (value = "$value")', async ({ func, expectedSectionKey, value }) => {
    const key = 'key'
    const yarMock = {
      get: jest.fn(),
      set: jest.fn()
    }
    const requestSetMock = { yar: yarMock }

    session[func](requestSetMock, key, value)

    expect(requestSetMock.yar.get).toHaveBeenCalledTimes(1)
    expect(requestSetMock.yar.get).toHaveBeenCalledWith(expectedSectionKey)
    expect(requestSetMock.yar.set).toHaveBeenCalledTimes(1)
    expect(requestSetMock.yar.set).toHaveBeenCalledWith(expectedSectionKey, { [key]: value })
  })
})
