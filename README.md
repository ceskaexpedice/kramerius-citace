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

GitHub: [https://github.com/trineracz/citation-api](https://github.com/trineracz/citation-api)

## Popis API

### `/citation`

Např. `http://localhost:3000/citation?uuid=uuid:869e4730-6c8b-11e2-8ed6-005056827e52&exp=iso690&format=html&lang=cs`

#### Parametry:

- **uuid**: UUID objektu. Povinny parametr.
- **exp**: `iso690 | mla | bibtex | wiki | ris | all` (default vrací iso690 ve formátu txt).
- **format**: `txt | html ` (default vrací pro všechny exp).
- **lang**: `cs | en | de | sk` (default = cs)
- **ref**: `true | false` citace s / bez odkazu na digitální dokument (default = false)
- **debug**: `true | false` citace s api a MODS dokumentu pro kontrolu (default = false)


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

### Docker

#### Distribuce Docker image

##### Build
```
docker build -t citation-api .
```
případně včetně tagu verze  
```
docker build -t martinrehanek/citation-api:1.1.0 .
```
případně včetně tagu verze a tagu `latest`
```
docker build -t martinrehanek/citation-api:latest -t martinrehanek/citation-api:1.1.0 .
```

##### Hostování 
```
docker push martinrehanek/citation-api:1.1.0
docker push martinrehanek/citation-api:latest
```

#### Spuštění Docker image

##### Lokální image
```
docker run -p 3000:3000 citation-api
```
případně konkrétní verzi
```
docker run -p 3000:3000 martinrehanek/citation-api:latest
```

##### Docker Hub
```
docker pull martinrehanek/citation-api:latest
docker run -p 3000:3000 martinrehanek/citation-api
```

##### Na nestandardním portu
Vnější (host) port lze změnit takto:
```
docker run -p 1234:3000 martinrehanek/citation-api
```

## API
Webová dokumentace je dostupná na nasezené aplikaci, na cestě `/api-docs`.

http://localhost:3000/api-docs/

### build OpenAPI dokumentace
Dokumentace se upravuje v souborech v adresáři `openapi-src`. Následně je potřeba z těchto soborů vygenerovat výsledný soubor `openapi.json` takto:
`swagger-cli bundle openapi-src/__api.yaml -o openapi.json`

### validace openapi.json
Po větším množství změn je vhodně validovat soubor `openapi.json`. I nevalidní soubor sice může fungovat, ale jen částečně. Validaci spustíme takto:
`swagger-cli validate openapi.json`