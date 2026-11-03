# Citation API

Služba, která z metadat dokumentu v Krameriu (Solr index + MODS) sestaví
bibliografickou citaci. Vstupem je UUID objektu a adresa API konkrétního
Krameria, výstupem citace ve formátu ISO 690, MLA, BibTeX, Wikipedie nebo RIS.

## Norma

Zdroj normy ISO690:2022: [Výklad ISO690:2022 PDF](https://www.citace.com/Vyklad-CSN-ISO-690-2022.pdf)

Příklady: [Příklady ISO690:2022](https://citace.zcu.cz/home.html)

MLA 9(2021): [easybib.com](https://www.easybib.com/guides/citation-guides/mla-format/mla-citation/)

Bibtex: [bibtex.eu](https://bibtex.eu/)

Wiki monografie: [citace monografie](https://cs.wikipedia.org/wiki/%C5%A0ablona:Citace_monografie)

Wiki periodikum: [citace periodika](https://cs.wikipedia.org/wiki/%C5%A0ablona:Citace_periodika)

RIS [RIS na wiki](https://en.wikipedia.org/wiki/RIS_(file_format))

RIS [RIS na Refman](https://web.archive.org/web/20100726184137/http://www.refman.com/support/risformat_tags_01.asp)

## Projekt

GitHub: [https://github.com/ceskaexpedice/kramerius-citace](https://github.com/ceskaexpedice/kramerius-citace)

Produkční nasazení: [https://citace.ceskadigitalniknihovna.cz](https://citace.ceskadigitalniknihovna.cz)

## Popis API

Aplikace poslouchá na portu `3000` (pevně v `src/index.ts`) a nabízí tyto cesty:

| Cesta | Popis |
| --- | --- |
| `/` | Úvodní stránka s verzí a odkazy |
| `/api/v1` | Sestavení citace (viz níže) |
| `/api-docs` | Interaktivní OpenAPI dokumentace (Swagger UI) |
| `/test` | Vývojářský výpis zpracování ukázkových MODS souborů z `src/test/testMods` |

### `/api/v1`

Např. `http://localhost:3000/api/v1?url=https://api.kramerius.mzk.cz&uuid=uuid:869e4730-6c8b-11e2-8ed6-005056827e52&exp=iso690&format=html&lang=cs`

#### Parametry

- **url**: Adresa API Krameria, ve kterém se objekt nachází, např.
  `https://api.kramerius.mzk.cz` nebo `https://api.ceskadigitalniknihovna.cz`.
  Služba na ni volá `/search/api/client/v7.0/search` a
  `/search/api/client/v7.0/items/{uuid}/metadata/mods`. Povinný parametr.
- **uuid**: UUID objektu včetně prefixu, např. `uuid:869e4730-…`. Povinný parametr.
- **exp**: `iso690 | mla | bibtex | wiki | ris | all` (default `iso690`).
  `all` vrátí JSON se všemi formáty najednou (`iso690`, `iso690html`, `mla`,
  `mlahtml`, `bibtex`, `wiki`, `ris`).
- **format**: `txt | html` (default `txt`). Ovlivňuje jen `iso690` a `mla`,
  u kterých existuje HTML varianta s kurzívou a odkazem; `bibtex`, `wiki` a
  `ris` jsou vždy prostý text. Hodnota určuje i hlavičku `Content-Type`.
- **lang**: `cs | en | de | sk` (default `cs`). Jazyk zkratek a spojek
  v citaci (`s.`, `roč.`, `č.`, `a` …). Názvy parametrů wiki šablony jsou vždy
  české, protože cílem je česká Wikipedie.
- **ref**: URL digitálního dokumentu, které se připojí na konec citace
  („Dostupné z: …“, `url = {…}`, `url = …`, `L1  - …`). Když chybí nebo je
  prázdný, citace odkaz neobsahuje.
- **debug**: `true | false` (default `false`). Odpověď je JSON a kromě citace
  obsahuje i zdrojová data z API (`apiSource`), MODS (`modsSource`) a při
  `roles=true` diagnostiku rolí (`roleDiagnostics`).
- **roles**: `true | false` (default `true`). Zohlednění rolí u jmen v MODS,
  viz níže.

#### Chybové odpovědi

| Kód | Příčina |
| --- | --- |
| `400` | Neznámá hodnota `exp` nebo `format` |
| `422` | Chybí `uuid` nebo `url` |
| `500` | Objekt se nepodařilo načíst z Krameria nebo selhalo zpracování |

#### Podporované modely

Citace se sestavuje podle hodnoty `model` v indexu Krameria. Stránka (`page`)
se cituje podle svého rodiče a doplní se číslo stránky.

| Modely | Způsob citace | Wiki šablona |
| --- | --- | --- |
| `monograph`, `monographunit`, `convolute`, `map`, `graphic`, `sheetmusic`, `archive`, `manuscript`, `soundrecording`, `collection` | monografie | `Citace monografie` |
| `internalpart` | kapitola v monografii | `Citace monografie` |
| `periodical` | titul periodika | `Citace periodika` |
| `periodicalvolume`, `periodicalitem`, `supplement` | ročník / číslo / příloha periodika | `Citace periodika` |
| `article` | článek v periodiku | `Citace periodika` |
| `soundunit`, `track` | zvuková jednotka / stopa (jako ročník periodika) | `Citace periodika` |
| ostatní | obecný záznam (BibTeX `@misc`, RIS `GEN`) | `Citace monografie` |

#### Poznámka k `roles`

Pokud parametr `roles` v dotazu chybí, použije se `roles=true`. Explicitním
`roles=false` lze zachovat původní zpracování všech `mods:name`. Při
`roles=true` se role rozdělí do slotů `primary`, `editor`, `contributor`,
`imprint` a `excluded`: autor jde na začátek citace, editoři a další
přispěvatelé do odpovídajících polí jednotlivých formátů a nakladatelské či
provenienční role se neuvádějí jako autoři.

Chybějící role osobních jmen se odvozují v tomto pořadí: `usage="primary"`,
jediné jméno, duplikát jména s rolí, jméno vedle známého primárního autora a
pořadí jmen v záznamu. Korporace bez role se vylučují. Jména
`type="conference"` se do autorské části nikdy nezahrnují. Neznámé role se
spolu s rolí `oth` („jiná role“) vyloučí a označí v diagnostice ke kontrole.
Osobní jména bez role, která nelze určit jako hlavního tvůrce, se rovněž
vyloučí; obecná role „přispěvatel“ se v citaci nepoužívá. Role `cmp`, `lbt`,
`art` a `ctg` se stávají primárními pouze u odpovídajícího modelu dokumentu.
Režisér (`drt`) se stejně jako editor může stát prvním údajem, pokud záznam
nemá hlavního tvůrce.

V ISO 690 se role vedlejšího tvůrce zapisuje za jeho přirozeně řazeným jménem
v kulatých závorkách. Editor se označuje `ed.`, sestavovatel `sest.`,
překladatel `překl.` a ilustrátor `il.`, například `Jan NOVÁK (překl.)`;
ostatní role se uvádějí celým názvem. Interpunkce seznamu hlavních tvůrců
používá mezi jmény středníky; poslední jméno se připojuje spojkou podle
zvoleného jazyka.

Při kombinaci `roles=true&debug=true` odpověď obsahuje také
`roleDiagnostics` s použitými sloty, jistotou, příznakem `needsReview` a
auditním seznamem deduplikovaných jmen.

## Výstupní formáty

Ukázky pro monografii `uuid:869e4730-6c8b-11e2-8ed6-005056827e52` z MZK
s `ref=https://www.digitalniknihovna.cz/mzk/uuid/uuid:869e4730-6c8b-11e2-8ed6-005056827e52`:

```
iso690:  ČAPEK, Karel a ČAPEK, Josef. Devatero pohádek, dvě navíc. 1. vyd. Praha: SNDK, 1959. Dostupné z: https://www.digitalniknihovna.cz/mzk/uuid/uuid:869e4730-6c8b-11e2-8ed6-005056827e52
mla:     Čapek, Karel, and Josef Čapek. Devatero pohádek, dvě navíc. SNDK, 1959. Digitální knihovna, https://www.digitalniknihovna.cz/mzk/uuid/uuid:869e4730-6c8b-11e2-8ed6-005056827e52
bibtex:  @book{uuid:869e4730-6c8b-11e2-8ed6-005056827e52, author = {{Čapek}, Karel and {Čapek}, Josef}, title = {Devatero pohádek, dvě navíc}, edition = {1. vyd.}, address = {Praha}, publisher = {SNDK}, year = {1959}, url = {https://www.digitalniknihovna.cz/mzk/uuid/uuid:869e4730-6c8b-11e2-8ed6-005056827e52}}
wiki:    {{ Citace monografie | příjmení = Čapek | jméno = Karel | příjmení2 = Čapek | jméno2 = Josef | titul = Devatero pohádek, dvě navíc | vydání = 1. vyd. | místo = Praha | vydavatel = SNDK | rok vydání = 1959 | url = https://www.digitalniknihovna.cz/mzk/uuid/uuid:869e4730-6c8b-11e2-8ed6-005056827e52 }}
ris:     TY  - BOOK
         AU  - Čapek, Karel
         AU  - Čapek, Josef
         TI  - Devatero pohádek, dvě navíc
         ET  - 1. vyd.
         PP  - Praha
         PB  - SNDK
         PY  - 1959
         L1  - https://www.digitalniknihovna.cz/mzk/uuid/uuid:869e4730-6c8b-11e2-8ed6-005056827e52
         ER  -
```

### Wikipedie (`exp=wiki`)

Výstup je volání šablony české Wikipedie: `{{ Citace monografie | … }}` pro
monografické dokumenty a `{{ Citace periodika | … }}` pro periodika (viz tabulka
modelů výše). Názvy parametrů jsou vždy české bez ohledu na `lang`.

Mapování údajů na parametry šablony:

| Údaj | `Citace monografie` | `Citace periodika` |
| --- | --- | --- |
| autoři | `příjmení`, `jméno`, `příjmení2`, `jméno2`, … (korporace `autor`, `autor2`, …) | stejně |
| editoři, překladatelé | `editor-last`/`editor-first`, `translator-last`/`translator-first` | stejně |
| název dokumentu | `titul` | – |
| název periodika | – | `periodikum` |
| název článku | – | `titul` |
| vydání | `vydání` | – |
| místo, vydavatel | `místo`, `vydavatel` | `místo`, `vydavatel` |
| rok vydání (i rozmezí let) | `rok vydání` | `rok vydání` (titul, ročník) |
| datum vydání čísla | – | `datum vydání` (ve tvaru, v jakém je v Krameriu, např. `07.10.1904`) |
| ročník, číslo, příloha | – | `ročník`, `číslo`, `příl. č.` |
| stránka / rozsah stran | `strany` | `strany` |
| identifikátory | `isbn`, `doi` | `issn`, `doi` (jen číslo, předponu „ISBN“/„ISSN“ doplňuje šablona) |
| odkaz z parametru `ref` | `url` | `url` |

Šablona `Citace periodika` vyhrazuje `titul` pro název článku a `den vydání`
pouze pro číslo dne v měsíci (1–31). Proto se u čísla, ročníku i titulu
periodika název posílá do `periodikum` a datum do `datum vydání`. Parametr
`id` ani `via` šablona pro UUID nepoužívá, a proto se nevyplňují.

Ukázky pro titul Světozor z České digitální knihovny (`url=https://api.ceskadigitalniknihovna.cz`):

```
periodikum (uuid:bd5fdc60-256c-11e5-8454-005056825209):
{{ Citace periodika | periodikum = Světozor: světová kronika současná slovem i obrazem : časopis pro zábavu i poučení | místo = Praha | vydavatel = J. Otto | rok vydání = 1904-1943 | url = … }}

ročník (uuid:74970240-2c9d-11e6-ae84-005056827e51):
{{ Citace periodika | periodikum = Světozor: světová kronika současná slovem i obrazem : časopis pro zábavu i poučení | místo = Praha | vydavatel = J. Otto | ročník = 5 | rok vydání = 1904-1905 | url = … }}

číslo (uuid:8f7a0e30-2cc1-11e6-b821-5ef3fc9bb22f):
{{ Citace periodika | periodikum = Světozor: světová kronika současná slovem i obrazem : časopis pro zábavu i poučení | místo = Praha | vydavatel = J. Otto | ročník = 5 | číslo = 1 | datum vydání = 07.10.1904 | url = … }}

stránka čísla (uuid:02f341c0-2d57-11e6-a344-5ef3fc9ae867):
{{ Citace periodika | periodikum = Světozor: světová kronika současná slovem i obrazem : časopis pro zábavu i poučení | místo = Praha | vydavatel = J. Otto | ročník = 5 | číslo = 1 | datum vydání = 07.10.1904 | strany = [1] | url = … }}

článek (uuid:12616e26-7a99-49ed-ad69-74bfd68c3a65):
{{ Citace periodika | titul = Contents | periodikum = Československá psychologie: časopis pro psychologickou teorii a praxi | místo = Praha | vydavatel = Psychologický ústav AV ČR | ročník = 61 | číslo = 2 | datum vydání = 04.2017 | issn = 0009-062x | url = … }}
```

Vykreslení lze ověřit vložením výstupu do pískoviště na Wikipedii nebo přes
`https://cs.wikipedia.org/w/api.php?action=parse&contentmodel=wikitext&prop=text&text=…`.

## Použití v [uživatelském rozhraní Krameria](https://github.com/ceskaexpedice/kramerius-web-client)

Doplňte do `/assets/shared/globals.js`

```
var APP_GLOBAL = {
...
  citationService: 'https://citace.ceskadigitalniknihovna.cz',
  citationServiceType: 'new',
  krameriusList: [
...
```


## Provoz

### Instalace závislostí
```
npm install
```

### Spuštění (vývoj)
```
npm run dev
```

### Spuštění (produkční)
```
npm run start
```

Aplikace běží na `http://localhost:3000`. Verze, přepínač produkčního
režimu a adresa serveru pro OpenAPI dokumentaci jsou v objektu `config`
v `src/index.ts`.

### Testy

Jednotkové testy (Jest + ts-jest) jsou v adresáři `tests` a pracují s MODS
soubory v `src/test/testMods`:

```
npm test
```

Jeden konkrétní soubor:

```
npx jest tests/citationRoles.test.ts
```

Rychlou kontrolu citace proti živému Krameriu lze udělat spuštěnou aplikací,
např.
`http://localhost:3000/api/v1?url=https://api.kramerius.mzk.cz&uuid=uuid:869e4730-6c8b-11e2-8ed6-005056827e52&exp=all`.

### Zvýšení verze

Verze aplikace je vedená v `package.json` (jediný zdroj pravdy). Zvýšení verze
a jeho zacommitování se dělá jedním příkazem:

```shell
npm run bump-version-patch   # 1.3.3 -> 1.3.4
npm run bump-version-minor   # 1.3.3 -> 1.4.0
npm run bump-version-major   # 1.3.3 -> 2.0.0
```

Skript odmítne běžet, pokud jsou v pracovním stromu necommitnuté změny, aby se
do commitu s verzí nezamíchalo něco nesouvisejícího. Novou verzi rozkopíruje do
`src/index.ts` (`config.version`) a do docker tagů v tomto README a výsledek
zacommituje. Samotné rozkopírování bez bumpu a commitu lze spustit i zvlášť:

```shell
npm run sync-version
```

Verze v `openapi.json` se nesynchronizuje – do dokumentace se vkládá až za běhu
z `config.version` (viz `initSwagger` v `src/index.ts`).

### Aktualizace zranitelných závislostí

```shell
npm run audit-fix
```

Spustí `npm install` a `npm audit fix` (bez `--force`, takže se aplikují jen
nerozbíjející aktualizace) a pokud se `package.json` / `package-lock.json`
změnily, zacommituje právě tyhle dva soubory.

## Docker Build & Run

### Build
```shell
docker build -t trinera/citation-api .
```

případně včetně tagu verze
```shell
docker build -t trinera/citation-api:1.3.5 .
```

případně včetně tagu verze a tagu `latest`
```shell
docker build -t trinera/citation-api:1.3.5 -t trinera/citation-api:latest .
```

### Push na Docker Hub

Jen pokud máš právo zápisu do repozitáře [trinera/citation-api](https://hub.docker.com/r/trinera/citation-api/tags)
na Docker Hubu. Pro spuštění lokálně sestaveného image to potřeba není.

```shell
docker push trinera/citation-api:1.3.5
docker push trinera/citation-api:latest
```

### Build & push na Docker Hub (multiplatformní)

Sestaví image pro `linux/amd64` i `linux/arm64` a rovnou ho pushne na Docker Hub.

```shell
docker buildx build --platform linux/amd64,linux/arm64 -t trinera/citation-api:1.3.5 --push .
```

případně včetně tagu `latest`
```shell
docker buildx build --platform linux/amd64,linux/arm64 \
  -t trinera/citation-api:1.3.5 \
  -t trinera/citation-api:latest \
  --push .
```

Multiplatformní build vyžaduje buildx builder s podporou více platforem. Pokud
ještě žádný nemáš, vytvoř ho jednorázově takto:
```shell
docker buildx create --name multiplatform --use --bootstrap
```

### Spuštění Docker image

#### Lokální image

Spuštění lokálně sestaveného image.

```shell
docker run -p 3000:3000 trinera/citation-api
```

případně konkrétní verze
```shell
docker run -p 3000:3000 trinera/citation-api:1.3.5
```

#### Image stažený z Docker Hubu

Spuštění image, který někdo sestavil a pushnul na Docker Hub.

```shell
docker pull trinera/citation-api:latest
docker run -p 3000:3000 trinera/citation-api:latest
```

#### Na nestandardním portu

Vnější (host) port lze změnit takto:
```shell
docker run -p 1234:3000 trinera/citation-api:latest
```

Aplikace pak běží na

http://localhost:1234

## API
Webová dokumentace je dostupná na nasezené aplikaci, na cestě `/api-docs`.

https://citace.ceskadigitalniknihovna.cz/api-docs/

### build OpenAPI dokumentace
Dokumentace se upravuje v souborech v adresáři `openapi-src`. Následně je potřeba z těchto soborů vygenerovat výsledný soubor `openapi.json` takto:
`swagger-cli bundle openapi-src/__api.yaml -o openapi.json`

### validace openapi.json
Po větším množství změn je vhodně validovat soubor `openapi.json`. I nevalidní soubor sice může fungovat, ale jen částečně. Validaci spustíme takto:
`swagger-cli validate openapi.json`
