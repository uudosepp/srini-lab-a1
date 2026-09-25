/**
 * Uue funktsiooni testid — "topeltpunktide nädalavahetus".
 *
 * `calculatePoints` peab hakkama vastu võtma valikulist välja `isDoubleWeekend`
 * (vt README.md "Sinu ülesanne"). Need testid EI ole sinu lahenduse osa —
 * grader kirjutab selle faili enne igat hindamist kanoonilise sisuga üle.
 * Juhud on osalt seemnest tuletatud, samal põhjusel mis regression-check.mjs-is.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calculatePoints } from "../src/points.mjs";
import { pick, rng } from "./seeded.mjs";

const SEED = process.env.SRINI_HIDDEN_SEED ?? "local-selfcheck";

const MULT = { BRONZE: 1.0, SILVER: 1.25, GOLD: 1.5, PLATINUM: 2.0 };
const EXCLUDED = ["KINKEKAART", "TARNE"];
function expectedTier(total) {
  if (total >= 5000) return "PLATINUM";
  if (total >= 2000) return "GOLD";
  if (total >= 500) return "SILVER";
  return "BRONZE";
}
function expectedWeekend({ cents, category, totalPointsBeforePurchase }) {
  if (EXCLUDED.includes(category)) return 0;
  const tier = expectedTier(totalPointsBeforePurchase);
  const withMultiplier = Math.floor(Math.floor(cents / 100) * MULT[tier]) * 2;
  return withMultiplier + (cents >= 10000 ? 20 : 0);
}

test("topeltnädalavahetus kahekordistab tavapunktid", () => {
  const weekday = calculatePoints({
    cents: 3000,
    category: "MUU",
    totalPointsBeforePurchase: 0,
    isDoubleWeekend: false,
  });
  const weekend = calculatePoints({
    cents: 3000,
    category: "MUU",
    totalPointsBeforePurchase: 0,
    isDoubleWeekend: true,
  });
  assert.equal(weekday, 30);
  assert.equal(weekend, 60);
});

test("kahekordistamine toimub PÄRAST ümardamist, mitte enne", () => {
  // base=11 (11,50 €), SILVER kordaja 1,25: floor(11*1,25)=13, *2=26.
  // Vale järjekord (kahekordista enne floor'i) annaks 27.
  const weekend = calculatePoints({
    cents: 1150,
    category: "MUU",
    totalPointsBeforePurchase: 500,
    isDoubleWeekend: true,
  });
  assert.equal(weekend, 26);
});

test("suurostu lisaboonust EI kahekordistata", () => {
  const weekend = calculatePoints({
    cents: 10000,
    category: "MUU",
    totalPointsBeforePurchase: 2000,
    isDoubleWeekend: true,
  });
  assert.equal(weekend, 320);
});

test("välistatud kategooria jääb 0-ks ka nädalavahetusel", () => {
  const weekend = calculatePoints({
    cents: 5000,
    category: "KINKEKAART",
    totalPointsBeforePurchase: 0,
    isDoubleWeekend: true,
  });
  assert.equal(weekend, 0);
});

test("vaikimisi (väli puudub) käitub nagu tavapäev", () => {
  const withoutFlag = calculatePoints({ cents: 3000, category: "MUU", totalPointsBeforePurchase: 0 });
  assert.equal(withoutFlag, 30);
});

test("15 seemnest tuletatud juhtu klapivad täpselt nädalavahetuse valemiga", () => {
  const next = rng(`${SEED}:feature`);
  const categories = ["MUU", "TOIT", "RIIDED", "ELEKTROONIKA", "KINKEKAART", "TARNE"];
  for (let i = 0; i < 15; i++) {
    const cents = 1 + Math.floor(next() * 60000);
    const category = pick(next, categories);
    const totalPointsBeforePurchase = Math.floor(next() * 7000);
    const got = calculatePoints({ cents, category, totalPointsBeforePurchase, isDoubleWeekend: true });
    const want = expectedWeekend({ cents, category, totalPointsBeforePurchase });
    assert.equal(got, want, `cents=${cents} category=${category} total=${totalPointsBeforePurchase}`);
  }
});
