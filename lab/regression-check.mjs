/**
 * Olemasoleva käitumise KAITSE — see fail ei ole sinu lahenduse osa.
 *
 * Sinu uus funktsioon peab lisanduma OLEMASOLEVALE käitumisele, mitte seda
 * asendama. Juhud on osalt SEEMNEST tuletatud (mitte fikseeritud), et
 * `calculatePoints`-i ei saaks läbida konkreetsete sisendite jaoks kirjutatud
 * otsingutabeliga, ilma tegelikku loogikat mõistmata.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calculatePoints } from "../src/points.mjs";
import { tierForTotal } from "../src/tiers.mjs";
import { activePoints } from "../src/expiry.mjs";
import { pick, rng } from "./seeded.mjs";

const SEED = process.env.SRINI_HIDDEN_SEED ?? "local-selfcheck";

function expectedTier(total) {
  if (total >= 5000) return "PLATINUM";
  if (total >= 2000) return "GOLD";
  if (total >= 500) return "SILVER";
  return "BRONZE";
}
const MULT = { BRONZE: 1.0, SILVER: 1.25, GOLD: 1.5, PLATINUM: 2.0 };
const EXCLUDED = ["KINKEKAART", "TARNE"];

function expectedPoints({ cents, category, totalPointsBeforePurchase }) {
  if (EXCLUDED.includes(category)) return 0;
  const tier = expectedTier(totalPointsBeforePurchase);
  const withMultiplier = Math.floor(Math.floor(cents / 100) * MULT[tier]);
  return withMultiplier + (cents >= 10000 ? 20 : 0);
}

test("BRONZE tase, tavaost", () => {
  assert.equal(calculatePoints({ cents: 3000, category: "MUU", totalPointsBeforePurchase: 0 }), 30);
});

test("suurostu boonus liidetakse, mitte ei korrutata", () => {
  assert.equal(
    calculatePoints({ cents: 10000, category: "MUU", totalPointsBeforePurchase: 2000 }),
    170,
  );
});

test("tase põhineb koguseisul ENNE ostu", () => {
  assert.equal(tierForTotal(2000), "GOLD");
  assert.equal(tierForTotal(499), "BRONZE");
  assert.equal(tierForTotal(5000), "PLATINUM");
});

test("punktid aeguvad täpselt 12 kuu pärast, piir kaasa arvatud", () => {
  const history = [{ points: 10, earnedAt: "2025-01-15" }];
  assert.equal(activePoints(history, "2026-01-14"), 10);
  assert.equal(activePoints(history, "2026-01-15"), 0);
});

test("20 seemnest tuletatud juhtu klapivad täpselt olemasoleva valemiga", () => {
  const next = rng(`${SEED}:regression`);
  const categories = ["MUU", "TOIT", "RIIDED", "ELEKTROONIKA", "KINKEKAART", "TARNE"];
  for (let i = 0; i < 20; i++) {
    const cents = 1 + Math.floor(next() * 60000);
    const category = pick(next, categories);
    const totalPointsBeforePurchase = Math.floor(next() * 7000);
    const got = calculatePoints({ cents, category, totalPointsBeforePurchase });
    const want = expectedPoints({ cents, category, totalPointsBeforePurchase });
    assert.equal(got, want, `cents=${cents} category=${category} total=${totalPointsBeforePurchase}`);
  }
});
