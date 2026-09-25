/**
 * Punktide aegumine.
 *
 * Iga kirje aegub täpselt 12 kuud pärast teenimist — piir on KAASA ARVATUD:
 * aastapäeval endal ei ole kirje enam aktiivne.
 */
const EXPIRY_MONTHS = 12;

export function activePoints(history, asOfDate) {
  const asOf = new Date(asOfDate);
  return history
    .filter((entry) => {
      const expiry = new Date(entry.earnedAt);
      expiry.setMonth(expiry.getMonth() + EXPIRY_MONTHS);
      return asOf < expiry;
    })
    .reduce((sum, entry) => sum + entry.points, 0);
}
