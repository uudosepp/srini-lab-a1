/**
 * Mõõteloogika enda testid. Ei ole sinu lahenduse osa — grader kirjutab
 * `lab/` enne hindamist üle.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { touchedFiles, SRC_FILES } from "./diff-tags.mjs";
import { selectQuestions } from "./questions.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const originalDir = path.join(here, "original-src");

function makeSrcDir(overrides = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "a1-src-"));
  for (const file of SRC_FILES) {
    fs.writeFileSync(path.join(dir, file), overrides[file] ?? fs.readFileSync(path.join(originalDir, file), "utf8"));
  }
  return dir;
}

test("touchedFiles — puutumata src annab tühja komplekti", () => {
  const dir = makeSrcDir();
  assert.deepEqual([...touchedFiles(dir)], []);
});

test("touchedFiles — points.mjs muutus tuvastatakse", () => {
  const dir = makeSrcDir({ "points.mjs": fs.readFileSync(path.join(originalDir, "points.mjs"), "utf8") + "\n// muudetud\n" });
  assert.deepEqual([...touchedFiles(dir)], ["points.mjs"]);
});

test("touchedFiles — tiers.mjs muutus tuvastatakse eraldi", () => {
  const dir = makeSrcDir({ "tiers.mjs": fs.readFileSync(path.join(originalDir, "tiers.mjs"), "utf8") + "\n// muudetud\n" });
  assert.deepEqual([...touchedFiles(dir)], ["tiers.mjs"]);
});

test("selectQuestions — sama seeme + sama puudutatud komplekt annab sama tulemuse", () => {
  const a = selectQuestions("s1", new Set());
  const b = selectQuestions("s1", new Set());
  assert.deepEqual(a, b);
});

test("selectQuestions — eri seeme annab erineva komplekti", () => {
  const a = selectQuestions("s1", new Set());
  const b = selectQuestions("s2", new Set());
  assert.notDeepEqual(a, b);
});

test("selectQuestions — alati täpselt 10 küsimust, igaühel 4 erinevat valikut ja kehtiv õige täht", () => {
  for (const touched of [new Set(), new Set(["tiers.mjs"]), new Set(["tiers.mjs", "bonuses.mjs", "expiry.mjs"])]) {
    const qs = selectQuestions("check", touched);
    assert.equal(qs.length, 10, `touched=${[...touched]}`);
    for (const q of qs) {
      const values = Object.values(q.options);
      assert.equal(new Set(values).size, 4, `q ${q.id} peab andma 4 ERINEVAT vastust: ${values}`);
      assert.ok(["A", "B", "C", "D"].includes(q.correctLetter));
      assert.ok(q.options[q.correctLetter] !== undefined);
    }
  }
});

test("selectQuestions — puudutatud mooduli küsimuste arv tõuseb 2-lt 3-le, points langeb", () => {
  const untouched = selectQuestions("weight", new Set());
  const touched = selectQuestions("weight", new Set(["tiers.mjs"]));
  const count = (qs, tag) => qs.filter((q) => q.tag === tag).length;
  assert.equal(count(untouched, "tiers.mjs"), 2);
  assert.equal(count(touched, "tiers.mjs"), 3);
  assert.equal(count(untouched, "points"), 4);
  assert.equal(count(touched, "points"), 3);
});

test("selectQuestions — kolme mooduli puudutamine ei lange points'i alla 1", () => {
  const qs = selectQuestions("weight-all", new Set(["tiers.mjs", "bonuses.mjs", "expiry.mjs"]));
  const count = (tag) => qs.filter((q) => q.tag === tag).length;
  assert.equal(count("points"), 1);
  assert.equal(count("tiers.mjs"), 3);
  assert.equal(count("bonuses.mjs"), 3);
  assert.equal(count("expiry.mjs"), 3);
  assert.equal(qs.length, 10);
});

test("selectQuestions — kõigi kolme õige-vastuse valem annab tegelikult 3 erinevat väärtust (mitte kokkulangevusi)", () => {
  for (let i = 0; i < 30; i++) {
    const qs = selectQuestions(`fuzz-${i}`, new Set());
    for (const q of qs.filter((x) => x.tag === "points")) {
      assert.equal(new Set(Object.values(q.options)).size, 4, q.text);
    }
  }
});
