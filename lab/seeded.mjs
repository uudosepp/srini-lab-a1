/**
 * Seemnest tuletatud juhuslikkus.
 *
 * Sama kood on ka Ticketsi graderi juures (`grader-lib.mjs`) — ja see on
 * TAHTLIK koopia. Labi repo antakse arendajale eraldi kätte; ta ei tohi ega
 * saa Ticketsi koodi sisse ulatuda. Alternatiiv oleks avaldada viieteistkümne
 * rea pärast pakk, mida keegi ei uuendaks.
 *
 * Tähtis on, et mõlemad annavad sama jada: mõõdud peavad labis ja graderis
 * kokku langema, muidu saab arendaja ise mõõtes teise tulemuse kui grader.
 */
export function rng(seed) {
  let h = 2166136261;
  for (const ch of String(seed)) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick(next, items) {
  return items[Math.floor(next() * items.length) % items.length];
}
