# Citation API

## Norma

Zdroj normy ISO690:2022: [ISO690:2022 PDF](https://www.citace.com/Vyklad-CSN-ISO-690-2022.pdf)

## Projekt

GitHub: [https://github.com/trineracz/citation-api](https://github.com/trineracz/citation-api)

## Popis API

### `/test`

Např. `http://localhost:3000/test`

Spustí testy na předpřipravených datech.

### `/citation`

Např. `http://localhost:3000/citation?uuid=uuid:869e4730-6c8b-11e2-8ed6-005056827e52&form=html&lang=cs`

#### Parametry:

- **uuid**: UUID objektu.
- **format**: `html | txt | undefined` (vrací JSON se vším včetně zdroje).
- **lang**: `cs | en`


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

#### Build Docker image
```
docker build -t citation-api .
```

#### Spuštění Docker image
```
docker run -p 3000:3000 citation-api
```
