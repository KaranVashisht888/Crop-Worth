// Pure calculation, split out from the service so it's testable without a
// database: share of a buyer's resolved transactions that were actually
// completed, rather than falling through.
export function calculateReliabilityScore(statuses) {
  if (statuses.length === 0) return null;
  const completed = statuses.filter((status) => status === "COMPLETED").length;
  return completed / statuses.length;
}
