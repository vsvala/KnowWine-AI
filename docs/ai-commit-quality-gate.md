# AI-avusteinen laadunvarmistus ennen committia

## Miksi tämä on olemassa

Ennen kuin muutokset menevät gittiin tässä monorepossa (`back/` + `front/`,
sama repo), tarkistukset ajetaan automaattisesti — riippumatta siitä
committaako kehittäjä itse terminaalista vai tekeekö Claude Code committin
puolestaan. Tavoite on kiinni jäävät virheet, muotoiluongelmat, vuotaneet
salaisuudet ja ilmeiset bugit ennen kuin ne päätyvät historiaan, sekä
kannustaa hyvin muotoiltuihin, yhteen asiaan keskittyviin committeihin.

Git itsessään ei tue "pre-add"-hookia (vain esim. pre-commit), joten
ainoa universaali kiinnekohta joka kattaa kaikki committaajat on
`git commit`. Claude Code -istunnossa on lisäksi nopeampi esitarkistus jo
`git add`-hetkellä.

## Arkkitehtuuri: kolme osaa

```
┌─────────────────────┐     ┌──────────────────────┐
│ Claude Code          │     │ (mikä tahansa muu     │
│ PreToolUse-hook       │     │  tapa committaa:      │
│ git add *             │     │  terminaali, editori) │
└──────────┬───────────┘     └──────────┬────────────┘
           │ nopea esitarkistus          │
           │ (lint/tsc/test/secrets)     │
           ▼                             ▼
       (git add tapahtuu)                │
           │                             │
           └─────────────┬───────────────┘
                          ▼
                 git commit käynnistyy
                          │
                          ▼
              .githooks/pre-commit
     (secrets + lint/tsc/test + npm audit)
                          │  kova gate, estää virheellä
                          ▼
              commit-viestin kirjoitus
                          │
                          ▼
              .githooks/commit-msg
   (1 claude -p -kutsu: koodikatselmointi +
    commit-viesti + kuulumattomat muutokset)
                          │  estää VAIN BLOCKING-löydöksellä
                          ▼
                    committi valmis
```

### 1. `.githooks/pre-commit` — deterministinen gate

Ajaa aina, kaikille committeille:

1. **Secrets-tarkistus** — estää jos staged-sisällössä on `.env`-tiedostoja,
   yksityisavaimia tai ilmeisiä kovakoodattuja tokeneita/salaisuuksia.
2. **Lint + testit** skoopin mukaan (`back/` ja/tai `front/`, riippuen mitä
   on muuttunut) — `npm run lint`, `npm run tsc` (front), `npm test`.
3. **`npm audit`** — samat komennot kuin CI:ssä
   (`.github/workflows/pipeline.yml`): backend `--audit-level=high`,
   frontend allowlistattu `jq`-suodatus (`GHSA-qwww-vcr4-c8h2`).

Kaikki paitsi audit ovat kova este: virhe = committi ei mene läpi. Katso
[Ohitusmekanismit](#ohitusmekanismit) audit-vaiheen osalta.

Jokainen vaihe tulostaa etukäteen mitä se on tekemässä
(`▶ [2/4] back: lint (npm run lint)`) — ei vain lopputulosta.

### 2. `.githooks/commit-msg` — yhdistetty AI-arviointi

Ainoa hook jolla on käytettävissä sekä diff että itse commit-viesti, joten
tänne on keskitetty **koko** AI-arviointi yhdellä `claude -p`-kutsulla
(Haiku 4.5 — halvin malli, riittävä rajattuun diff-tason tarkistukseen):

1. **Koodikatselmointi** — kevyt, diffiin skoopattu versio
   `.claude/agents/fullstack-reviewer.md`:n BLOCKING/MAJOR/MINOR-
   formaatista. Keskittyy vain BLOCKING-tason asioihin (tietoturva, datan
   menetys, rikkinäinen kontrakti, kaatuminen) + ilmeisimpiin MAJOR/MINOR-
   huomioihin. Syvempi katselmointi: käytä `/code-review`-skilliä tai
   `fullstack-reviewer`-agenttia manuaalisesti.
2. **Commit-viestin laatu** — Conventional Commits -muoto, ks.
   [`CONTRIBUTING.md`](../CONTRIBUTING.md).
3. **Kuulumattomat muutokset** — yhdistääkö tämä diffi toisiinsa
   liittymättömiä muutoksia? Jos kyllä, ehdottaa jakoa erillisiin
   committeihin.

**Estää committin vain jos koodikatselmoinnissa löytyy BLOCKING-tason
ongelma.** Commit-viesti- ja scope-huomiot ovat aina neuvoa-antavia —
niiden "oikeellisuus" on subjektiivista eikä sovi kovaksi gateksi.

**Token-tehokkuus**: AI-kutsu ohitetaan kokonaan (a) triviaaleille
committeille (vain `.md`/lockfile/binäärimuutoksia) ja (b) yli n. 1500
rivin diffeille — näissä tulostetaan vain huomautus, ei AI-kutsua.

**Fail-open**: jos `claude -p` ei ole käytettävissä (ei verkkoa, ei
kirjautunut, komentoa ei löydy) — teknisistä syistä, ei sisällöllisistä —
committi menee silti läpi varoituksella. Deterministiset tarkistukset
pre-commitissa eivät riipu tästä.

### 3. Claude Code `PreToolUse`-hook (`.claude/hooks/pre-add-check.sh`)

Rekisteröity `/Users/virvasvala/KnowWine-AI/.claude/settings.json`:iin,
laukeaa vain `git add`-alkuisille Bash-komennoille Claude Coden istunnossa.
Ajaa saman secrets + lint/tsc/test-logiikan kuin pre-commit (jaettu
`.githooks/lib/run-checks.sh`), mutta stagemattomien muutosten skoopilla —
antaa Claudelle nopean palautteen jo ennen stagingia, ei odota
committihetkeen asti. Ei toista audit- tai AI-review-vaihetta, koska ne
hoituvat joka tapauksessa git-hookeissa committihetkellä.

**Huom**: `.claude/`-kansio on tämän repon `.gitignoressa`, joten tämä hook
ja sen `settings.json`-rekisteröinti ovat toistaiseksi vain paikallisia
tälle koneelle — eivät siirry mukana toisiin klooneihin.

## Käyttöönotto uudessa kloonissa

`.git/hooks/` ei ole versioitu, joten git pitää ohjata käyttämään
repossa olevaa `.githooks/`-kansiota:

```bash
git config core.hooksPath .githooks
```

Tämä on repo-lokaali asetus — jokaisen uuden kloonin/työkopion pitää ajaa
tämä kerran.

## Ohitusmekanismit

Nämä ovat tietoisia, dokumentoituja aukkoja — eivät bugeja:

- **`SKIP_AUDIT_GATE=1 git commit ...`** — ohittaa `npm audit`-eston
  ei-interaktiivisessa tilanteessa (esim. Claude Coden ajama commit) kun
  haavoittuvuudet halutaan tietoisesti jättää korjaamatta. Interaktiivisessa
  terminaalissa sama kysytään `[y/N]`-kehotteella, ei tarvitse
  ympäristömuuttujaa.
- **Fail-open AI-review** — jos `claude -p` ei toimi teknisistä syistä,
  committi menee läpi ilman AI-arviointia. Deterministiset tarkistukset
  (lint/tsc/testit/secrets/audit) ovat silti aina voimassa.
- **Triviaali/liian iso diffi** — AI-review ohitetaan automaattisesti
  (ks. yllä), ei vaadi erillistä lippua.

Lint/tsc/testit/secrets **eivät** ole ohitettavissa millään lipulla — nämä
ovat aina kova gate.

## Rajoitteet

- Backendin testit vaativat käynnissä olevan Postgres-tietokannan ja
  `TEST_DATABASE_URL`-ympäristömuuttujan paikallisesti (ks.
  `back/env.example`).
- Secrets-tarkistus on kevyt, regex-pohjainen — kattaa yleisimmät tapaukset
  muttei ole yhtä kattava kuin esim. gitleaks. Voidaan korvata
  kattavammalla työkalulla myöhemmin jos tarve ilmenee.
- Playwright-e2e-testit (`front/e2e/`) eivät ole mukana — vaativat
  käynnissä olevat palvelimet, liian hitaita pre-commit-tarkistukseen.
  CI (`pipeline.yml`) ajaa ne edelleen push/PR:llä.
