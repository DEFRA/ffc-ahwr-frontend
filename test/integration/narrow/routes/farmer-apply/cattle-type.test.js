describe('Cattle Type test', () => {
  test('GET /farmer-apply/cattle-type route returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/farmer-apply/cattle-type',
      auth: global.__AUTH__
    }
    const res = await global.__SERVER__.inject(options)
    expect(res.statusCode).toBe(200)
  })
  test('POST /farmer-apply/cattle-type route returns 200', async () => {
    const options = {
      method: 'POST',
      url: '/farmer-apply/cattle-type',
      payload: { crumb: global.__CRUMB_VALUE__, 'cattle-type': 'beef' },
      auth: global.__AUTH__,
      headers: global.__CRUMB_HEADER__
    }
    const res = await global.__SERVER__.inject(options)
    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toEqual('/farmer-apply/sheep')
  })
  test('POST /farmer-apply/cattle-type route returns Error', async () => {
    const options = {
      method: 'POST',
      url: '/farmer-apply/cattle-type',
      payload: { crumb: global.__CRUMB_VALUE__, 'cattle-type': 'xyz' },
      auth: global.__AUTH__,
      headers: global.__CRUMB_HEADER__
    }
    const res = await global.__SERVER__.inject(options)
    expect(res.payload).toContain('Select the type of cattle that you keep')
    expect(res.statusCode).toBe(200)
  })
})
