import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const ORIGINAL_DIR = path.join(here, "original-src");

export const SRC_FILES = ["points.mjs", "tiers.mjs", "bonuses.mjs", "expiry.mjs"];

/**
 * Milliseid mooduleid arendaja OMA muudatuses tegelikult puudutas —
 * `points.mjs` on ALATI puudutatud (see ongi ülesanne), ülejäänud kolm on
 * "loe, ära muuda" moodulid. Kui arendaja mõne neist siiski muutis, on see
 * täpselt see signaal, mille pealt küsimuste komplekt PEALE REAGEERIB (vt
 * `questions.mjs` `selectQuestions`) — dokumendi nõue "10 kontrollküsimust
 * ... mis genereeritakse arendaja enda muudatusest".
 */
export function touchedFiles(srcDir) {
  const touched = new Set();
  for (const file of SRC_FILES) {
    const original = fs.readFileSync(path.join(ORIGINAL_DIR, file), "utf8");
    let current;
    try {
      current = fs.readFileSync(path.join(srcDir, file), "utf8");
    } catch {
      continue;
    }
    if (current !== original) touched.add(file);
  }
  return touched;
}
