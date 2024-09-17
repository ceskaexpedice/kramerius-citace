import { getLocale } from '../locales';

// Funkce pro zpracování MODS autorů
export async function parseModsAuthors(mods: any, lang: any): Promise<string> {
  let locale = getLocale(lang);
  const authorsList: string[] = [];

  let names = mods["mods:modsCollection"]["mods:mods"][0]["mods:name"];
//   console.log('names', JSON.stringify(names, null, 2));

  if (!names) return ''; // Pokud nejsou žádní autoři, vrátíme prázdný řetězec

  names.forEach((name: any) => {
    // Ověření, že namePart existuje a je polem
    const namePart = name['mods:namePart'];
    if (!namePart || !Array.isArray(namePart)) return;
    let family = '';
    let given = '';
    let fullName = '';
    
    namePart.forEach((part: any) => {
        if (typeof part === 'string') {
            // Pokud je part řetězec, bereme ho jako celé jméno
            fullName = part;
            family = fullName.split(', ')[0];
            given = fullName.split(', ')[1];
            // console.log('1 family, given', family, ', ', given);
        } 
        if (part.$?.type === 'family') {
            if (part._ && part._.length > 0) {
                family = part._;
            }   
            // console.log('2 family', family, ', ', given);
        } 
        if (part.$?.type === 'given') {
            if (part._ && part._.length > 0) {
                given = part._;
            }
            // console.log('3 given', family, ', ', given);
        }
    });

    if (family.length > 0 && given.length > 0) {
        // Pokud máme příjmení a jméno
        authorsList.push(`${family.toUpperCase() || ''}, ${given || ''}`.trim());
    } else if (family.length > 0 || given.length > 0) {
        // Pokud máme pouze jedno z nich
        authorsList.push(`${family || given}`.trim());
    }
  });

  if (authorsList.length === 0) return '';
  if (authorsList.length === 1) return `${authorsList[0]}.`;
  if (authorsList.length > 4) return `${authorsList[0]} et al.`;
  return `${authorsList.slice(0, -1).join(', ')}` + ' ' + locale['and'] + ' ' + `${authorsList[authorsList.length - 1]}.`;
}

export async function parseModsTitles(mods: any, lang: any): Promise<string> {
    let locale = getLocale(lang);
    let titlesList: string = '';
    const titleInfo = mods["mods:modsCollection"]["mods:mods"][0]["mods:titleInfo"];
    // console.log('titles', JSON.stringify(titleInfo, null, 2));

    if (!titleInfo) return ''; // Pokud nejsou žádné tituly, vrátíme prázdný řetězec

    // projdeme všechny tituly
    titleInfo.forEach((titleObj: any) => {
        // Získání hlavního titulu
        const title = titleObj["mods:title"] || '';

        // Získání podnázvu (volitelné)
        const subTitle = titleObj["mods:subTitle"] || '';

        // Cislo casti
        const partNumber = titleObj["mods:partNumber"] || '';

        // Nazev casti
        const partName = titleObj["mods:partName"] || '';

        // Kontrola, zda jde o alternativní titul (nechceme je zařazovat do hlavního titulu)
        if (titleObj.$?.type === 'alternative') {
            return; // Přeskočíme alternativní tituly
        }

        // Sestavení formátu Název: podnázev
        if (title) {
            titlesList += (`${title}`);
        }
        if (subTitle) {
            titlesList += (`: ${subTitle}.`);
        } else {
            titlesList += ('.');
        }
        if (partNumber) {
            titlesList += (` ${locale['part']} ${partNumber}`);
        }
        if (partName) {
            titlesList += (`, ${partName}`);
        } else if (partNumber) {
            titlesList += ('.');
        }
    });
    // console.log('titlesList', titlesList);
    // Vrátíme všechny tituly spojené dohromady
    return titlesList;
}


export async function parseModsPublisher(mods: any, lang: any): Promise<string> {
    if (mods["mods:modsCollection"]["mods:mods"][0]["mods:originInfo"] && mods["mods:modsCollection"]["mods:mods"][0]["mods:originInfo"][0]) {
        const originInfo = mods["mods:modsCollection"]["mods:mods"][0]["mods:originInfo"][0];
        // console.log('originInfo', JSON.stringify(originInfo, null, 2));

        if (!originInfo) return ''; // Pokud nejsou k dispozici žádné nakladatelské údaje, vrátíme prázdný řetězec.

        // Získání místa vydání (první místo, kde není authority "marccountry")
        const places = originInfo["mods:place"];
        let placeOfPublication = '';

        if (places) {
            // Najdeme první místo bez authority "marccountry"
            const relevantPlace = places.find((place: any) => place["mods:placeTerm"][0]?.$?.authority !== "marccountry");
            if (relevantPlace) {
                placeOfPublication = relevantPlace["mods:placeTerm"][0]?._ || '';
            }
        }

        // Získání vydavatele
        const publisher = originInfo["mods:publisher"] || '';

        // Získání roku vydání
        const dateIssued = originInfo["mods:dateIssued"] || '';
        let dateIssuedString = '';
        if (dateIssued.length === 1) {
            dateIssuedString = dateIssued[0]; // Odstraníme mezery na začátku a konci
        } else if (dateIssued.length > 1) {
            dateIssued.forEach((date: any) => {
                if (date && date?.$?.encoding === 'marc') {
                    dateIssuedString = date._.trim() || '';
                }
            });
        }

        // Získání edice (volitelné)
        const edition = originInfo["mods:edition"] || '';

        // Vytvoření výsledného řetězce
        let result = '';

        if (edition) {
            result += `${edition[0].trim()}`; // Odstraníme mezery na začátku a konci
            if (!result.endsWith('.')) {
                result += '.'; // Přidáme tečku, pokud řetězec nekončí tečkou
            }
            result += ' '; // Přidáme mezeru po tečce
        }

        if (placeOfPublication) {
            result += `${placeOfPublication}: `;
        }

        if (publisher) {
            result += `${publisher}`;
        }

        if (dateIssuedString) {
            result += `, ${dateIssuedString}.`;
        } else {
            result += '.';
        }

        // Pokud nemáme žádná data, vrátíme prázdný řetězec, jinak vrátíme výsledek
        return result.trim() ? result : '';
    } else {
        return '';
    }
}

export async function parseModsCartographics(mods: any, lang: any): Promise<string> {
    let cartographics: any;
    let scaleString: string = '';
    const subject = mods["mods:modsCollection"]["mods:mods"][0]['mods:subject'];

    if (!subject) return ''; // Pokud nejsou žádné údaje, vrátíme prázdný řetězec

    subject.forEach((cartographicObj: any) => {
        // Získání kartografické údaje
        cartographics = cartographicObj["mods:cartographics"] || '';
        if (!cartographics) return; // Pokud nejsou žádné kartografické údaje, přeskočíme tento objekt

        cartographics.forEach((cartographicObj: any) => {
            // Získání měřítka
            let scaleArray = cartographicObj["mods:scale"];
            if (!scaleArray || !Array.isArray(scaleArray)) return; // Ověříme, zda je scale pole

            scaleArray.forEach((scale: string) => {
                if (typeof scale === 'string' && scale.startsWith('Měřítko ')) {
                    scale = scale.substring(8); // Ořežeme "Měřítko "
                }
                // Sestavení formátu Název: podnázev
                if (scale) {
                    scaleString += (`${scale}.`);
                }
            });
        });
    });

    return scaleString;
}



