#!/usr/bin/env node
/**
 * Loeb esitaja `answers.json`-i (submission'i juurest) ja loeb, mitu vastust
 * klapib seemnest+diffist tuletatud küsimuste komplektiga. Puuduv fail või
 * vigane JSON EI ole 0 õiget vastust juhuslikult — ta ongi 0, sest mõõtmata
 * suurus ei ole hea suurus.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { touchedFiles } from "./diff-tags.mjs";
import { selectQuestions } from "./questions.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const seed = process.env.SRINI_HIDDEN_SEED ?? process.argv[2] ?? "local-selfcheck";

const touched = touchedFiles(path.join(root, "src"));
const questions = selectQuestions(seed, touched);

let submitted = {};
try {
  submitted = JSON.parse(fs.readFileSync(path.join(root, "answers.json"), "utf8"));
} catch {
  submitted = {};
}

let correct = 0;
for (const q of questions) {
  if (submitted[q.id] === q.correctLetter) correct += 1;
}

console.log(JSON.stringify({ questionsCorrect: correct, questionsTotal: questions.length }));
