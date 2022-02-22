module.exports = {
  method: 'GET',
  path: '/eligible-organisations',
  options: {
    auth: false,
    handler: async (_, h) => {
      // TODO: Get this data based on eligibility
      const organisations = [{
        name: 'Arthington Dairy Ltd',
        sbi: '106599006'
      }, {
        name: 'D B Stockwell & Son',
        sbi: '103489123'
      }, {
        name: 'P & D Fearnley & Sons',
        sbi: '103491987'
      }]
      return h.view('eligible-organisations', { organisations })
    }
  }
}
