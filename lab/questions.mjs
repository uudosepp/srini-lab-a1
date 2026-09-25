import { rng, pick } from "./seeded.mjs";

/**
 * Küsimuste pank "topeltpunktide nädalavahetuse" (arendaja OMA muudatuse) ja
 * kolme naabermooduli (tiers/bonuses/expiry — "loe, ära muuda") kohta.
 *
 * Mõlemat liiki küsimusi on SIIN rohkem, kui korraga küsitakse —
 * `selectQuestions` valib seemnest KOMBINATSIOONI, ja `points`-i küsimuste
 * stsenaariumid (summad, kategooriad, tasemed) on ISE seemnest tuletatud, nii
 * et need EI ole kunagi täpselt samad, mis arendaja oma `srini-lab start`
 * seemnega enesekontrollis nägi.
 */

const MULT = { BRONZE: 1.0, SILVER: 1.25, GOLD: 1.5, PLATINUM: 2.0 };
const EXCLUDED = ["KINKEKAART", "TARNE"];
const CATEGORIES = ["MUU", "TOIT", "RIIDED", "ELEKTROONIKA"];

function tierForTotal(total) {
  if (total >= 5000) return "PLATINUM";
  if (total >= 2000) return "GOLD";
  if (total >= 500) return "SILVER";
  return "BRONZE";
}
function basePoints(cents) {
  return Math.floor(cents / 100);
}
function bonus(cents) {
  return cents >= 10000 ? 20 : 0;
}

// Ainuke ÕIGE valem — kasutatakse õige vastuse arvutamiseks.
function correctWeekend({ cents, category, totalPointsBeforePurchase }) {
  if (EXCLUDED.includes(category)) return 0;
  const tier = tierForTotal(totalPointsBeforePurchase);
  return Math.floor(basePoints(cents) * MULT[tier]) * 2 + bonus(cents);
}
function correctWeekday({ cents, category, totalPointsBeforePurchase }) {
  if (EXCLUDED.includes(category)) return 0;
  const tier = tierForTotal(totalPointsBeforePurchase);
  return Math.floor(basePoints(cents) * MULT[tier]) + bonus(cents);
}

// Levinud VALED valemid — segavatest vastustest.
function wrongNoDouble(s) {
  return correctWeekday(s);
}
function wrongDoublesBonusToo(s) {
  if (EXCLUDED.includes(s.category)) return 0;
  return correctWeekday(s) * 2; // kahekordistab KOGU tulemuse, sh lisaboonuse
}
function wrongDoubleBeforeFloor(s) {
  if (EXCLUDED.includes(s.category)) return 0;
  const tier = tierForTotal(s.totalPointsBeforePurchase);
  return Math.floor(basePoints(s.cents) * MULT[tier] * 2) + bonus(s.cents);
}
function wrongIgnoresExclusion(s) {
  const tier = tierForTotal(s.totalPointsBeforePurchase);
  return Math.floor(basePoints(s.cents) * MULT[tier]) * 2 + bonus(s.cents);
}

const LETTERS = ["A", "B", "C", "D"];

/** Neli erinevat väärtust A–D-ks, õige vastus SEEMNEST tuletatud kohal. */
function buildOptions(next, correct, wrongCandidates) {
  const values = [correct];
  for (const w of wrongCandidates) {
    if (!values.includes(w)) values.push(w);
    if (values.length === 4) break;
  }
  let pad = 1;
  while (values.length < 4) {
    const candidate = correct + pad * (pad % 2 === 0 ? -1 : 1);
    if (!values.includes(candidate) && candidate >= 0) values.push(candidate);
    pad += 1;
  }
  // Sega järjekord seemnest, jäta meelde, kus õige vastus lõpuks on.
  const shuffled = [...values];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const options = {};
  let correctLetter = "A";
  LETTERS.forEach((letter, i) => {
    options[letter] = String(shuffled[i]);
    if (shuffled[i] === correct) correctLetter = letter;
  });
  return { options, correctLetter };
}

function randomScenario(next, { forceExcluded = false, forceBulk = false, minCents = 1, maxCents = 60000 } = {}) {
  const cents = minCents + Math.floor(next() * (maxCents - minCents));
  const category = forceExcluded ? pick(next, EXCLUDED) : pick(next, CATEGORIES);
  const totalPointsBeforePurchase = Math.floor(next() * 7000);
  return {
    cents: forceBulk ? Math.max(cents, 10000) : cents,
    category,
    totalPointsBeforePurchase,
  };
}

/** `points` mooduli (isDoubleWeekend) küsimuste GENERAATORID — stsenaarium ISE on seemnest. */
const POINTS_GENERATORS = [
  (next) => {
    const s = randomScenario(next);
    const correct = correctWeekend(s);
    const { options, correctLetter } = buildOptions(next, correct, [wrongNoDouble(s), wrongDoublesBonusToo(s), wrongDoubleBeforeFloor(s)]);
    return {
      tag: "points",
      text: `Ost: ${(s.cents / 100).toFixed(2)} €, kategooria "${s.category}", kliendi punktide koguseis ENNE ostu ${s.totalPointsBeforePurchase}, isDoubleWeekend=true. Mitu punkti klient kokku saab?`,
      options,
      correctLetter,
    };
  },
  (next) => {
    // Piiripealne juht, kus floor(base*mult) EI ole täisarv enne kahekordistamist —
    // vale järjekord (kahekorda enne floor'i) annab TEISE tulemuse.
    const cents = 1150; // base=11
    const totalPointsBeforePurchase = 500; // SILVER, mult=1,25 -> 11*1,25=13,75
    const s = { cents, category: pick(next, CATEGORIES), totalPointsBeforePurchase };
    const correct = correctWeekend(s);
    const { options, correctLetter } = buildOptions(next, correct, [wrongDoubleBeforeFloor(s), wrongNoDouble(s), wrongDoublesBonusToo(s)]);
    return {
      tag: "points",
      text: `SILVER-tasemel klient (kordaja 1,25) ostab ${(cents / 100).toFixed(2)} € eest nädalavahetusel (isDoubleWeekend=true). Kas kahekordistamine toimub ÜMARDAMISE JÄREL või enne? Mitu punkti ta kokku saab?`,
      options,
      correctLetter,
    };
  },
  (next) => {
    const s = randomScenario(next, { forceBulk: true });
    const correct = correctWeekend(s);
    const { options, correctLetter } = buildOptions(next, correct, [wrongDoublesBonusToo(s), wrongNoDouble(s), wrongDoubleBeforeFloor(s)]);
    return {
      tag: "points",
      text: `Ost: ${(s.cents / 100).toFixed(2)} € (üle suurostu piiri), kategooria "${s.category}", koguseis enne ostu ${s.totalPointsBeforePurchase}, isDoubleWeekend=true. Kas 20-punktiline lisaboonus KAHEKORDISTUB ka? Mitu punkti kokku?`,
      options,
      correctLetter,
    };
  },
  (next) => {
    const s = randomScenario(next, { forceExcluded: true });
    const correct = correctWeekend(s); // alati 0
    const { options, correctLetter } = buildOptions(next, correct, [wrongIgnoresExclusion(s), correctWeekend(s) + 1, correctWeekend(s) + 20]);
    return {
      tag: "points",
      text: `Ost kategoorias "${s.category}" (välistatud), ${(s.cents / 100).toFixed(2)} €, isDoubleWeekend=true. Mitu punkti klient saab?`,
      options,
      correctLetter,
    };
  },
  (next) => {
    const s = randomScenario(next);
    const correct = correctWeekday(s);
    const { options, correctLetter } = buildOptions(next, correct, [correctWeekend(s), wrongDoublesBonusToo(s), correct + bonus(s.cents) + 5]);
    return {
      tag: "points",
      text: `Ost: ${(s.cents / 100).toFixed(2)} €, kategooria "${s.category}", koguseis enne ostu ${s.totalPointsBeforePurchase}, isDoubleWeekend VÄLI PUUDUB päringus üldse. Mitu punkti klient saab?`,
      options,
      correctLetter,
    };
  },
  (next) => {
    const boundary = pick(next, [500, 2000, 5000]);
    const s = { cents: 3000, category: pick(next, CATEGORIES), totalPointsBeforePurchase: boundary };
    const correct = correctWeekend(s);
    const belowTier = tierForTotal(boundary - 1);
    const wrongBelow = Math.floor(basePoints(s.cents) * MULT[belowTier]) * 2 + bonus(s.cents);
    const { options, correctLetter } = buildOptions(next, correct, [wrongBelow, wrongNoDouble(s), wrongDoubleBeforeFloor(s)]);
    return {
      tag: "points",
      text: `Kliendi punktide koguseis ENNE ostu on täpselt ${boundary} (taseme piir). Ost ${(s.cents / 100).toFixed(2)} €, isDoubleWeekend=true. Kumba taset kasutatakse ja mitu punkti kokku?`,
      options,
      correctLetter,
    };
  },
];

/** Kolme "loe, ära muuda" mooduli küsimuste STAATILISED pangad. */
const TIERS_BANK = [
  {
    text: "Milline tase on kliendil, kelle punktide koguseis ENNE ostu on täpselt 2000?",
    options: { A: "SILVER", B: "PLATINUM", C: "BRONZE", D: "GOLD" },
    correctLetter: "D",
  },
  {
    text: "Milline tase on kliendil, kelle punktide koguseis ENNE ostu on 499?",
    options: { A: "SILVER", B: "GOLD", C: "Viga — 499 ei kuulu ühelegi vahemikule", D: "BRONZE" },
    correctLetter: "D",
  },
  {
    text: "Milline tase vastab kordajale, mis on täpselt kaks korda suurem kui BRONZE oma?",
    options: { A: "SILVER", B: "PLATINUM", C: "GOLD", D: "Sellist ei ole" },
    correctLetter: "B",
  },
  {
    text: "Kas tase arvutatakse punktide koguseisust ENNE käesolevat ostu või PÄRAST (koos ostuga)?",
    options: {
      A: "PÄRAST — ost ise võib kliendi kõrgemale tasemele tõsta",
      B: "ENNE — käesolev ost ei saa iseennast kõrgemale tasemele tõsta",
      C: "Tase ei sõltu koguseisust üldse",
      D: "ENNE, aga ainult PLATINUM-tasemel",
    },
    correctLetter: "B",
  },
];

const BONUSES_BANK = [
  {
    text: 'Kas "TARNE" (tarneteenus) kategooria ostud teenivad punkte?',
    options: {
      A: "Ei, mitte kunagi",
      B: "Jah, alati",
      C: "Ainult kui ületab boonuspiiri",
      D: "Ainult GOLD-tasemel ja üle",
    },
    correctLetter: "A",
  },
  {
    text: "Millal lisandub 20-punktiline lisaboonus?",
    options: {
      A: "Kui ost on ÜLE 100 €",
      B: "Ainult PLATINUM-tasemel",
      C: "Ainult siis, kui ost on täpselt 100 €",
      D: "Kui ost on 100 € VÕI ROHKEM",
    },
    correctLetter: "D",
  },
  {
    text: "Kas suurostu lisaboonus (20 punkti) korrutatakse taseme kordajaga?",
    options: {
      A: "Jah — boonus saab sama kordaja mis baaspunktid",
      B: "Ei — boonus liidetakse alles pärast korrutamist",
      C: "Jah, aga ainult PLATINUM-tasemel ostude puhul",
      D: "Ei — boonust üldse ei rakendata SILVER-tasemel",
    },
    correctLetter: "B",
  },
];

const EXPIRY_BANK = [
  {
    text: "Punktid teeniti 15.01.2025. Mis on ESIMENE kuupäev, mil `activePoints` neid enam aktiivsete hulka EI loe?",
    options: { A: "14.01.2026", B: "16.01.2026", C: "15.01.2026", D: "15.02.2025" },
    correctLetter: "C",
  },
  {
    text: "Kas `activePoints` liidab aegunud kirjete punktid summasse kaasa?",
    options: {
      A: "Ei — need jäetakse summast välja",
      B: "Jah, alati",
      C: "Ainult siis, kui need on GOLD-tasemelt teenitud",
      D: "Ainult siis, kui `asOfDate` on samal kalendriaastal",
    },
    correctLetter: "A",
  },
  {
    text: "Mitu kuud pärast teenimist punktid aeguvad?",
    options: { A: "6", B: "24", C: "12", D: "Ei aegu kunagi" },
    correctLetter: "C",
  },
];

const MODULE_BANKS = { "tiers.mjs": TIERS_BANK, "bonuses.mjs": BONUSES_BANK, "expiry.mjs": EXPIRY_BANK };

function pickN(next, bank, n) {
  const pool = [...bank];
  const out = [];
  for (let i = 0; i < n && pool.length > 0; i++) {
    const idx = Math.floor(next() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

/**
 * 10 küsimust kokku. `points` (isDoubleWeekend, arendaja OMA muudatus) saab
 * baasina 4 kohta; iga "loe, ära muuda" moodul (tiers/bonuses/expiry) saab
 * baasina 2. Kui arendaja SIISKI muutis mõnda neist kolmest, tõuseb SELLE
 * mooduli kohtade arv 2-lt 3-le, `points`-i arvelt (miinimum 1) — komplekt
 * REAGEERIB otse sellele, mida arendaja oma diffis tegelikult puudutas.
 */
export function selectQuestions(seed, touched) {
  const next = rng(seed);
  const slots = { "points.mjs": 4, "tiers.mjs": 2, "bonuses.mjs": 2, "expiry.mjs": 2 };
  for (const file of ["tiers.mjs", "bonuses.mjs", "expiry.mjs"]) {
    if (touched.has(file) && slots["points.mjs"] > 1) {
      slots[file] += 1;
      slots["points.mjs"] -= 1;
    }
  }

  const chosenGenerators = pickN(next, POINTS_GENERATORS, slots["points.mjs"]);
  const pointsQuestions = chosenGenerators.map((gen) => gen(next));

  const moduleQuestions = [];
  for (const file of ["tiers.mjs", "bonuses.mjs", "expiry.mjs"]) {
    const picked = pickN(next, MODULE_BANKS[file], slots[file]);
    for (const q of picked) moduleQuestions.push({ tag: file, ...q });
  }

  const all = [...pointsQuestions, ...moduleQuestions];
  // Küsimuste endi järjekord seemnest, mitte alati "points enne, moodulid pärast".
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.map((q, i) => ({ id: `q${i + 1}`, tag: q.tag, text: q.text, options: q.options, correctLetter: q.correctLetter }));
}
