# A1 · Võõras koodibaas 3 tunniga

> Rada A — legacy koodibaasid ja migratsioonid.

## Ülesanne

`src/` on väike, aga päris moodul (`points.mjs`, `tiers.mjs`, `bonuses.mjs`, `expiry.mjs`) —
kliendipunktide arvutaja, mille kirjutas keegi teine kaks aastat tagasi. Kood töötab ja on
korrektne, aga miski EI ole dokumenteeritud: tasemepiirid, ümardamisreeglid, boonuse ja kordaja
järjekord, aegumise täpne piir. Sina pead need moodulitest välja lugema, ENNE kui midagi juurde
kirjutad.

**Sinu ülesanne:** lisa `calculatePoints`-ile valikuline väli `isDoubleWeekend` — "topeltpunktide
nädalavahetus". Kui see on `true`, kahekordistuvad TAVAPUNKTID (baas × taseme kordaja), aga MITTE
suurostu lisaboonus (20 punkti) ega välistatud kategooriate null. Täpne järjekord (kas
kahekordistad enne või pärast ümardamist) on osa sellest, mida pead koodist välja lugema — vale
järjekord annab vale tulemuse just piiripealsete summade peal.

## Kuidas hinnatakse

Kolm mõõdet:

1. **Peidetud funktsioonitestid** (`lab/feature-check.mjs`) — kontrollivad, kas `isDoubleWeekend`
   käitub täpselt spetsifikatsiooni järgi, sh piiripealsetel juhtudel. Osa sisenditest on
   seemnest tuletatud, et otsingutabeliga läbisaamine ei aitaks.
2. **10 kontrollküsimust, mis reageerivad SINU muudatusele** (`npm run quiz`) — vasta
   `answers.json`-isse (nt `{"q1":"B",...}`). Küsimused EI ole staatiline pank: 4 neist on ALATI
   `isDoubleWeekend`-i enda piiripealsed juhud (stsenaariumid ise on seemnest tuletatud — konkreetsed
   summad/kategooriad on iga kord teised), ja iga ülejäänud kolme "loe, ära muuda" mooduli
   (`tiers.mjs`, `bonuses.mjs`, `expiry.mjs`) kohta 2. **Kui su enda diff puudutab mõnda neist
   kolmest failist SINU LAHENDUSES** (git diff su `src/`-i ja algversiooni vahel), tõuseb SELLE
   mooduli küsimuste arv 2-lt 3-le — `points.mjs`-i arvelt. Miks: ülesanne ütleb "loe, ära muuda"
   nende kolme kohta; kui sa siiski muudad, on täpselt ÕIGE, et küsimuste komplekt hakkab rohkem
   just SELLE mooduli mõistmist kontrollima, mitte lihtsalt jätkab varasemat jaotust, nagu midagi
   ei oleks juhtunud.
3. **Regressioon** (`lab/regression-check.mjs`) — olemasolev käitumine ei tohi muutuda.

| tase | nõue |
|---|---|
| Pronks | funktsioonitestid rohelised |
| Hõbe | + vähemalt 8/10 kontrollküsimust õige |
| Kuld | + kõik 10/10 õige **ja** regressioon roheline |

## Alustamine

Repo käivitub devcontaineris ühe käsuga (`Reopen in Container`).

```bash
srini-lab start A1                      # trükib SINU isikliku seemne, nt "37d799e8c4d6983c"
npm test                                # sinu funktsiooni testid (kuni sa selle lisad, on need punased)
npm run quiz -- 37d799e8c4d6983c        # trükib SINU seemne JA praeguse diffi järgi valitud 10 küsimust
npm run check-answers -- 37d799e8c4d6983c  # loe answers.json ja trüki, mitu vastust klapib
npm run selfcheck -- 37d799e8c4d6983c   # kõik kolm mõõdet korraga, samamoodi mis grader näeb
srini-lab submit --evidence <PR-i link> --log ~/.claude/…/session.jsonl
```

**Anna seeme ALATI otse käsureale, mitte ainult `srini-lab start`-ile.** `npm run quiz`/
`check-answers`/`selfcheck` kasutavad ilma seemneta vaikimisi üldist `local-selfcheck` varianti —
sama, mida iga teine arendaja näeks, kui nemad samuti seemet ei annaks. Oma isikliku variandi
nägemiseks (ja selleks, et sinu `answers.json` klapiks TÄPSELT su enda `npm run quiz` väljundiga)
tuleb seeme igal käsul kaasa anda (`npm run <käsk> -- <seeme>` — npm's `--` on vajalik, muidu läheb
argument npm-ile endale, mitte skriptile). Päris hindamisel kasutab grader IKKAGI erinevat
(soolatud) seemet — vt "Miks tulemus võib erineda" allpool.

`npm run quiz` trükib kõik 10 küsimust nelja vastusevariandiga (A–D) — jooksuta see ALATI uuesti,
kui oled `src/`-i muutnud, sest komplekt ise võib muutuda (vt ülal). Kirjuta oma valikud
`answers.json`-isse täpselt samade võtmetega (`q1`…`q10`).

**Miks tulemus võib erineda enesekontrolli ja hindamise vahel.** `npm run quiz`/`npm run selfcheck`
kasutavad SINU seemet — hindamisel kasutatakse teistsugust (soolatud) seemet, nii et konkreetsed
summad/kategooriad on teised (aga sama LIIKI küsimused, samas jaotuses su enda diffi järgi).

## Mida lugeda enne kirjutamist

| moodul | mida see teeb |
|---|---|
| `src/tiers.mjs` | tase arvutatakse koguseisust ENNE ostu, mitte pärast |
| `src/bonuses.mjs` | välistatud kategooriad, suurostu lisaboonus |
| `src/expiry.mjs` | punktide aegumine (piir kaasa arvatud) |
| `src/points.mjs` | orkestreerib eelmisi — SIIA lisandub `isDoubleWeekend` |

## Vihje, mis on ühtlasi kogu labi mõte

Funktsioonitestid mõõdavad, kas sa oskad KIRJUTADA. Kontrollküsimused mõõdavad, kas sa said
koodist ka päriselt ARU — kaks eri asja, mida AI-abiga kirjutamine kergesti lahku laseb minna: on
täiesti võimalik kopeerida toimiv lahendus, ilma et päriselt mõistaksid, miks lisaboonus ei tohi
kordajaga korrutuda.
