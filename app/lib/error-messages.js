module.exports = {
  email: {
    enterEmail: 'Enter an email address',
    validEmail: 'Enter a valid email address'
  },
  name: {
    enterName: 'Enter the name of the vet',
    nameLength: 'Name must be 100 characters or fewer'
  },
  practice: {
    enterName: 'Enter the name of the practice',
    nameLength: 'Practice name must be 100 characters or fewer'
  },
  rcvs: {
    enterRCVS: 'Enter the RCVS number',
    validRCVS: 'Enter a valid RCVS number'
  },
  reference: {
    enterRef: 'Enter the reference number',
    validRef: 'The reference number has the format begining "VV-" followed by two groups of four characters e.g. "VV-A2C4-EF78"'
  },
  visitDate: {
    emptyValues: (val1, val2) => `Visit date must include a ${val1}${val2 ? ' and a ' + val2 : ''}`,
    enterDate: 'Enter the date of the visit',
    realDate: 'Visit date must be a real date',
    startDateOrAfter: (createdAt) => `Visit date must be the same as or after ${new Date(createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} when the application was created`,
    todayOrPast: 'Visit date must be today or in the past'
  },
  epgPercentage: {
    enterEpg: 'Enter EPG percentage',
    validEpg: 'Enter a valid EPG percentage'
  }
}
