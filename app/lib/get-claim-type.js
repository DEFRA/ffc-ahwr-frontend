function getClaimType (claimData) {
  const { whichReview } = claimData
  if (whichReview) {
    return whichReview
  }
  throw new Error('Unexpected species combination detected')
}

module.exports = {
  getClaimType
}
