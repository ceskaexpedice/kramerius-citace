# citation-api

## Norma

Zdroj normy ISO690:2022: https://www.citace.com/Vyklad-CSN-ISO-690-2022.pdf



## Projekt

github: https://github.com/trineracz/citation-api

instalace závislostí: npm install

spuštění (dev): npm run dev
spuštění (produkce): npm run start


## Popis API

/test
Např. http://localhost:3000/test
Spustí testy na předpřipravených datech.


/citation
Např. http://localhost:3000/citation?uuid=uuid:869e4730-6c8b-11e2-8ed6-005056827e52&form=html&lang=cs

### Parametry

uuid = uuid objektu

format = html | txt | undefined (vraci json se vsim vcetne zdroje)

lang = cs | en

### Docker

Vybuildění docker image: docker build -t citation-api .

Spuštění image: docker run -p 3000:3000 citation-api