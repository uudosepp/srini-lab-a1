/**
 * Kategooriaerandid ja suurostu lisaboonus.
 */
const EXCLUDED_CATEGORIES = ["KINKEKAART", "TARNE"];
export const BONUS_THRESHOLD_CENTS = 10000;
export const BONUS_FLAT = 20;

export function isExcludedCategory(category) {
  return EXCLUDED_CATEGORIES.includes(category);
}

/** Lisaboonus liidetakse taseme kordajaga korrutatud summale, mitte ei korrutata sellega kaasa. */
export function flatBonus(cents) {
  return cents >= BONUS_THRESHOLD_CENTS ? BONUS_FLAT : 0;
}
