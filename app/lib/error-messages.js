module.exports = {
  email: {
    enterEmail: 'Enter an email address',
    validEmail: 'Enter an email address in the correct format, like name@example.com'
  },
  name: {
    enterName: 'Enter the vet\'s full name',
    nameLength: 'Name must be 100 characters or fewer'
  },
  practice: {
    enterName: 'Enter the vet practice name',
    nameLength: 'Practice name must be 100 characters or fewer'
  },
  rcvs: {
    enterRCVS: 'Enter the RCVS number',
    validRCVS: 'Enter a valid RCVS number'
  },
  reference: {
    enterRef: 'Enter the reference number',
    validRef: 'Enter a reference number in the correct format including hyphens'
  },
  visitDate: {
    emptyValues: (val1, val2) => `Date must include a ${val1}${val2 ? ' and a ' + val2 : ''}`,
    enterDate: 'Enter the date of the visit',
    realDate: 'Date must be a real date',
    startDateOrAfter: (createdAt) => `Date must be the same or after ${new Date(createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} when the application was made`,
    todayOrPast: 'The date the review was completed must be in the past'
  },
  epgPercentage: {
    enterEpg: 'Enter the percentage reduction',
    validEpg: 'Enter the percentage reduction'
  }
}
