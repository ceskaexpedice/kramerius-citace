# Citation API

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

## Popis API

### `/api/v1`

Např. `http://localhost:3000/api/v1?uuid=uuid:869e4730-6c8b-11e2-8ed6-005056827e52&exp=iso690&format=html&lang=cs`

#### Parametry:

- **uuid**: UUID objektu. Povinny parametr.
- **exp**: `iso690 | mla | bibtex | wiki | ris | all` (default vrací iso690 ve formátu txt).
- **format**: `txt | html ` (default vrací pro všechny exp).
- **lang**: `cs | en | de | sk` (default = cs)
- **ref**: `string` citace s / bez odkazu na digitální dokument (default = false)
- **debug**: `true | false` citace s api a MODS dokumentu pro kontrolu (default = false)
- **roles**: `true | false` zohlednění rolí u jmen v MODS (default = true)

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
docker build -t citation-api .
```

případně včetně tagu verze
```shell
docker build -t ceskaexpedice/citation-api:1.3.3 .
```

případně včetně tagu verze a tagu `latest`
```shell
docker build -t ceskaexpedice/citation-api:1.3.3 -t ceskaexpedice/citation-api:latest .
```

### Push na Docker Hub

Jen pokud máš právo zápisu do repozitáře [ceskaexpedice/citation-api](https://hub.docker.com/r/ceskaexpedice/citation-api/tags)
na Docker Hubu. Pro spuštění lokálně sestaveného image to potřeba není.

```shell
docker push ceskaexpedice/citation-api:1.3.3
docker push ceskaexpedice/citation-api:latest
```

### Build & push na Docker Hub (multiplatformní)

Sestaví image pro `linux/amd64` i `linux/arm64` a rovnou ho pushne na Docker Hub.

```shell
docker buildx build --platform linux/amd64,linux/arm64 -t ceskaexpedice/citation-api:1.3.3 --push .
```

případně včetně tagu `latest`
```shell
docker buildx build --platform linux/amd64,linux/arm64 \
  -t ceskaexpedice/citation-api:1.3.3 \
  -t ceskaexpedice/citation-api:latest \
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
docker run -p 3000:3000 citation-api
```

případně konkrétní verze
```shell
docker run -p 3000:3000 ceskaexpedice/citation-api:1.3.3
```

#### Image stažený z Docker Hubu

Spuštění image, který někdo sestavil a pushnul na Docker Hub.

```shell
docker pull ceskaexpedice/citation-api:latest
docker run -p 3000:3000 ceskaexpedice/citation-api:latest
```

#### Na nestandardním portu

Vnější (host) port lze změnit takto:
```shell
docker run -p 1234:3000 ceskaexpedice/citation-api:latest
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
