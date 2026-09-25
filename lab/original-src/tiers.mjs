/**
 * Kliendi tasemed — arvutatakse punktide KOGUSEISUST ENNE käesolevat ostu,
 * mitte pärast. Nii ei saa üks suur ost iseennast kõrgemale tasemele tõsta.
 */
const TIER_THRESHOLDS = [
  ["PLATINUM", 5000],
  ["GOLD", 2000],
  ["SILVER", 500],
  ["BRONZE", 0],
];

export const TIER_MULTIPLIER = { BRONZE: 1.0, SILVER: 1.25, GOLD: 1.5, PLATINUM: 2.0 };

export function tierForTotal(totalPointsBeforePurchase) {
  for (const [tier, min] of TIER_THRESHOLDS) {
    if (totalPointsBeforePurchase >= min) return tier;
  }
  return "BRONZE";
}
