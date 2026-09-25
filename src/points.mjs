/**
 * Kliendipunktide arvutaja — orkestreerib tiers.mjs ja bonuses.mjs.
 *
 * Kirjutatud teise meeskonna poolt kaks aastat tagasi. Loogika töötab, aga
 * eeldusi ei ole kuskil kirja pandud — need tuleb koodist (ja naabermoodulitest
 * `tiers.mjs`, `bonuses.mjs`, `expiry.mjs`) välja lugeda.
 */
import { TIER_MULTIPLIER, tierForTotal } from "./tiers.mjs";
import { flatBonus, isExcludedCategory } from "./bonuses.mjs";

function basePoints(cents) {
  return Math.floor(cents / 100);
}

export function calculatePoints({ cents, category, totalPointsBeforePurchase }) {
  if (isExcludedCategory(category)) return 0;
  const tier = tierForTotal(totalPointsBeforePurchase);
  const withMultiplier = Math.floor(basePoints(cents) * TIER_MULTIPLIER[tier]);
  return withMultiplier + flatBonus(cents);
}
