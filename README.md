# citation-api

## Norma

Zdroj normy ISO690:2022: https://www.citace.com/Vyklad-CSN-ISO-690-2022.pdf

https://citace.zcu.cz/home.html


## Projekt

github: https://github.com/trineracz/citation-api

spuštění: npm run dev



## Popis API

/test
Např. http://localhost:3000/test
Spustí testy na předpřipravených datech.


/citation
Např. http://localhost:3000/citation?uuid=uuid:869e4730-6c8b-11e2-8ed6-005056827e52&form=html&lang=cs

### Parametry

uuid = uuid objektu

format = html | txt | bibtex | undefined (vraci json se vsim vcetne zdroje)

lang = cs | en

### Bibtex

https://bibtex.eu/cs/types/
https://bibtex.online/
