const auth = { credentials: { reference: '1111', sbi: '111111111' }, strategy: 'basic' }

describe('Pigs test', () => {
  test('GET /farmer-apply/declaration route returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/farmer-apply/declaration',
      auth
    }
    const res = await global.__SERVER__.inject(options)
    expect(res.statusCode).toBe(200)
  })
})
