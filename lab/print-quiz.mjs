#!/usr/bin/env node
/**
 * Trükib arendaja ENDA seemnega (`srini-lab start A1` väljund) küsimuste
 * komplekti loetavalt. Hindamisel kasutatakse teistsugust (soolatud) seemet
 * — vt README "Miks tulemus võib erineda".
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { touchedFiles } from "./diff-tags.mjs";
import { selectQuestions } from "./questions.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const seed = process.argv[2] ?? "local-selfcheck";

const touched = touchedFiles(path.join(root, "src"));
const questions = selectQuestions(seed, touched);

if (touched.size > 0) {
  console.log(`Puudutasid ka: ${[...touched].join(", ")} — küsimuste komplekt reageeris sellele.\n`);
}

for (const q of questions) {
  console.log(`${q.id} [${q.tag}]: ${q.text}`);
  for (const letter of ["A", "B", "C", "D"]) {
    console.log(`  ${letter}) ${q.options[letter]}`);
  }
  console.log();
}
console.log('Kirjuta valikud answers.json-isse: {"q1":"B",...}');
