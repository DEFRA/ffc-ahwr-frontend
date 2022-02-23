function getEligibleOrgs () {
  return [{
    name: 'My Dairy Ltd',
    sbi: '111111111',
    cph: '11/111/1111',
    address: '1 long lane, longton, AA11 1AA',
    email: 'dairy@ltd.com'
  }, {
    name: 'A Beer Farm',
    sbi: '222222222',
    cph: '22/222/2222',
    address: 'road end, roadton, BB22 2BB',
    email: 'beer@farm.com'
  }, {
    name: 'Ploughing troughs',
    sbi: '333333333',
    cph: '33/333/3333',
    address: 'suburbs, suburbia, suburito, CC33 3CC',
    email: 'ploughing@troughs.com'
  }]
}

module.exports = {
  getEligibleOrgs
}
