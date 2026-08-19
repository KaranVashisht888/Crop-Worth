// Pure auction rules, split out from the service so they're testable
// without a database.

// Bidding is strictly ascending: a new bid must exceed the current
// highest, or any amount is fine if nothing has been bid yet.
export function isValidNextBid(amount, currentHighestAmount) {
  if (currentHighestAmount === null || currentHighestAmount === undefined) return true;
  return amount > currentHighestAmount;
}

export function isBelowReserve(amount, reservePrice) {
  return amount < reservePrice;
}
