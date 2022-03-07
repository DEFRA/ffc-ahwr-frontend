module.exports = {
  method: 'GET',
  path: '/farmer-apply/check-answers',
  options: {
    handler: async (_, h) => {
      const rows = [{ key: { text: 'Livestock keeper' }, value: { text: 'Yes' } }]
      return h.view('farmer-apply/check-answers', { listData: { rows } })
    }
  }
}
