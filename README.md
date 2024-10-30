# Citation API

## Norma

Zdroj normy ISO690:2022: [Výklad ISO690:2022 PDF](https://www.citace.com/Vyklad-CSN-ISO-690-2022.pdf)

Příklady: [Příklady ISO690:2022](https://citace.zcu.cz/home.html)

Bibtex: [bibtex.eu](https://bibtex.eu/)

## Projekt

GitHub: [https://github.com/trineracz/citation-api](https://github.com/trineracz/citation-api)

## Popis API

### `/citation`

Např. `http://localhost:3000/citation?uuid=uuid:869e4730-6c8b-11e2-8ed6-005056827e52&format=html&lang=cs&`

#### Parametry:

- **uuid**: UUID objektu. Povinny parametr.
- **format**: `html | txt | bibtex` (default vrací JSON se všemi formaty).
- **lang**: `cs | en` (default = cs)
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

##### Hostování 
```
docker tag citation-api martinrehanek/citation-api:latest
docker push martinrehanek/citation-api:latest
```

#### Spuštění Docker image

##### Lokální image
```
docker run -p 3000:3000 citation-api
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
