import e from 'express';
import { getLocale } from '../locales';
import { parse } from 'path';

// Funkce pro zpracování MODS autorů
export async function parseModsAuthors(mods: any, lang: any): Promise<any> {
  let locale = getLocale(lang);
  const authorsList: string[] = [];

  let names = mods["mods:modsCollection"]["mods:mods"][0]["mods:name"];
//   console.log('names', JSON.stringify(names, null, 2));

  if (!names) return {'txt': '', 'bibtex': ''}; // Pokud nejsou žádní autoři, vrátíme prázdný řetězec

  names.forEach((name: any) => {
    // Ověření, že namePart existuje a je polem
    // vyfiltruji names, ktere neobsahuji nameTitleGroup (uniformni jmeno)
    if (!name.$?.nameTitleGroup) {
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

        if (family && family.length > 0 && given && given.length > 0) {
            // Pokud máme příjmení a jméno
            authorsList.push(`${family.toUpperCase() || ''}, ${given || ''}`.trim());
        } else if (family.length > 0 || given.length > 0) {
            // Pokud máme pouze jedno z nich
            authorsList.push(`${family || given}`.trim());
        }
    }
  });

  if (authorsList.length === 0) return {'txt': '', 'bibtex': ''};
  if (authorsList.length === 1) return {'txt': `${authorsList[0]}.`, 'bibtex': `${authorsList[0]}`};
  if (authorsList.length > 4) return {'txt': `${authorsList[0]} et al.`, 'bibtex': `${authorsList[0]} and others`};
  return {'txt':`${authorsList.slice(0, -1).join(', ')}` + ' ' + locale['and'] + ' ' + `${authorsList[authorsList.length - 1]}.`,
          'bibtex':`${authorsList.slice().join(' and ')}`};
}

export async function parseModsTitles(mods: any, lang: any): Promise<any> {
    let locale = getLocale(lang);
    let titlesList: string = '';
    const titleInfo = mods["mods:modsCollection"]["mods:mods"][0]["mods:titleInfo"];
    // console.log('titles', JSON.stringify(titleInfo, null, 2));

    if (!titleInfo) return ''; // Pokud nejsou žádné tituly, vrátíme prázdný řetězec

    // projdeme všechny tituly
    titleInfo.forEach((titleObj: any) => {
        // Vyfiltrujeme tituly, které neobsahují nameTitleGroup (uniformní název) a alternativni nazev
        if (!titleObj.$?.nameTitleGroup) {
            // Kontrola, zda jde o alternativní titul (nechceme je zařazovat do hlavního titulu)
            if (titleObj.$?.type === 'alternative') {
                return; // Přeskočíme alternativní tituly
            }
            // Získání hlavního titulu
            const title = titleObj["mods:title"] || '';
            // Získání podnázvu (volitelné)
            const subTitle = titleObj["mods:subTitle"] || '';
            // Cislo casti
            const partNumber = titleObj["mods:partNumber"] || '';
            // Nazev casti
            const partName = titleObj["mods:partName"] || '';


             // FORMAT MONOGRAFIE: Název: podnázev. Část číslo. Název části.
            if (title && String(title).length > 0) {
                console.log('title', title);
                titlesList += (`${title}`);
            }
            if (subTitle && String(subTitle).length > 0) {
                console.log('subTitle', subTitle);
                titlesList += (`: ${subTitle}.`);
            } else if (String(title).length > 0) {
                titlesList += ('.');
            }
            if (partNumber && String(partNumber).length > 0) {
                titlesList += (` ${locale['part']} ${partNumber}`);
                if (!String(partNumber).endsWith('.')) {
                    titlesList += ('.');
                }
            }
            if (partName && String(partName).length > 0) {
                titlesList += (` ${partName}`);
                if (!String(partName).endsWith('.')) {
                    titlesList += ('.');
                }
            }
        }
    });
    // console.log('titlesList', titlesList);
    // Vrátíme všechny tituly spojené dohromady
    
    return [titlesList];
}

export async function parsePeriodicalTitle(mods: any, apiData: any, lang: any): Promise<any> {
    let titleName = apiData['root.title'] || '';
    let issueDate = '';
    let articleName = '';

    if (apiData['model'] === 'periodicalitem') {
        issueDate = apiData['date.str'] || '';
    }
    if (apiData['model'] === 'article') {
        issueDate = apiData['date.str'] || '';
        articleName = apiData['title.search'].trim() || '';
        return [titleName, issueDate, articleName];
    } else {
        return [titleName, issueDate];
    }
}

export async function parsePeriodicalPublisher(modsData: any, apiData: any, lang: any, apiDataTitle: any, modsTitle: any, apiDataVolume?: any, modsVolume?: any, apiDataIssue?: any, modsIssue?: any): Promise<any> {
    let locale = getLocale(lang);
    let publicationData = modsTitle["mods:modsCollection"]["mods:mods"][0]["mods:originInfo"][0];
    let publisher = '';
    let placeOfPublication = '';
    let volume = '';
    let volumeDate = '';
    let issue = '';
    let issueDate = '';
    let articleName = '';
    let articlePageStart = '';
    let articlePageEnd = '';

    if (publicationData) {
        // Získání místa vydání (první místo, kde není authority "marccountry")
        const places = publicationData["mods:place"];
        if (places) {
            // Najdeme první místo bez authority "marccountry"
            const relevantPlace = places.find((place: any) => place["mods:placeTerm"][0]?.$?.authority !== "marccountry");
            if (relevantPlace) {
                placeOfPublication = relevantPlace["mods:placeTerm"][0]?._ || '';
                if (placeOfPublication.startsWith('[') && !placeOfPublication.endsWith(']')) {
                    placeOfPublication = placeOfPublication + ']';
                }
            }
        }
        // Získání vydavatele
        let publishers = publicationData["mods:publisher"];
        if (publishers && publishers.length > 0) {
            publisher = publishers[0] || '';
            if (publisher && publisher.startsWith('[') && !publisher.endsWith(']')) {
                publisher = publisher + ']';
            }
        }
    }
    // Získání dat o volume
    if (apiData['model'] === 'periodicalvolume') {
        volume = apiData['part.number.str'] || '';
        volumeDate = apiData['date.str'] || '';
    }
    // Získání dat o volume a issue
    if (apiData['model'] === 'periodicalitem') {
        volume = apiDataVolume['part.number.str'] || '';
        volumeDate = apiDataVolume['date.str'] || '';
        issue = apiData['part.number.str'] || '';
        issueDate = apiData['date.str'] || '';
    }
    // Získání dat o volume, issue a article
    if (apiData['model'] === 'article') {
        volume = apiDataVolume['part.number.str'] || '';
        volumeDate = apiDataVolume['date.str'] || '';
        issue = apiDataIssue['part.number.str'] || '';
        issueDate = apiDataIssue['date.str'] || '';
        articleName = apiData['title.search'] || '';
        if (modsData["mods:modsCollection"]["mods:mods"][0]["mods:relatedItem"]?.[0]?.["mods:part"]?.[0]?.["mods:extent"]?.[0]?.["mods:start"]?.[0]) {
            articlePageStart = modsData["mods:modsCollection"]["mods:mods"][0]["mods:relatedItem"]?.[0]?.["mods:part"]?.[0]?.["mods:extent"]?.[0]?.["mods:start"]?.[0] || '';
            console.log('articlePageStart', articlePageStart);
        } else if (modsData["mods:modsCollection"]["mods:mods"][0]["mods:part"]?.[0]?.["mods:extent"]?.[0]?.["mods:start"]?.[0]) {
            articlePageStart = modsData["mods:modsCollection"]["mods:mods"][0]["mods:part"]?.[0]?.["mods:extent"]?.[0]?.["mods:start"]?.[0] || '';
        }
        if (modsData["mods:modsCollection"]["mods:mods"][0]["mods:relatedItem"]?.[0]?.["mods:part"]?.[0]?.["mods:extent"]?.[0]?.["mods:end"]?.[0]) {
            articlePageEnd = modsData["mods:modsCollection"]["mods:mods"][0]["mods:relatedItem"]?.[0]?.["mods:part"]?.[0]?.["mods:extent"]?.[0]?.["mods:end"]?.[0] || '';
            console.log('articlePageEnd', articlePageEnd);
        } else if (modsData["mods:modsCollection"]["mods:mods"][0]["mods:part"]?.[0]?.["mods:extent"]?.[0]?.["mods:end"]?.[0]) {
            articlePageEnd = modsData["mods:modsCollection"]["mods:mods"][0]["mods:part"]?.[0]?.["mods:extent"]?.[0]?.["mods:end"]?.[0] || '';
        }
    }

    // Vytvoření výsledného řetězce
    let txt = '';
    let bibtex = '';
    if (placeOfPublication && placeOfPublication.length > 0) {
        txt += `${placeOfPublication}`;
        bibtex += `address = {${placeOfPublication}}, `;
        if (publisher && publisher.length > 0) {
            txt += `: `;
        }
    }
    if (publisher && publisher.length > 0) {
        txt += `${publisher}`;
        bibtex += `publisher = {${publisher}}, `;
    }
    if (volume && volume.length > 0) {
        txt += `, ${locale['volume']} ${volume}`;
        bibtex += `volume = {${volume}}, `;
    }
    if (volumeDate && volumeDate.length > 0 && volumeDate !== volume) {
        txt += ` (${volumeDate})`;
        bibtex += `date = {${volumeDate}}, `;
    }
    if (issue && issue.length > 0) {
        txt += `, ${locale['issue']} ${issue}`;
        bibtex += `issue = {${issue}}`;
    }
    if (articlePageStart && articlePageStart.length > 0) {
        txt += `, ${locale['page']} ${articlePageStart}`;
        if (articlePageEnd && articlePageEnd.length > 0 && articlePageEnd !== articlePageStart) {
            txt += `-${articlePageEnd}.`;
        } else {
            txt += '.';
        }
    }

    return {'txt': txt, 'bibtex': bibtex};
}


export async function parseModsPublisher(mods: any, lang: any): Promise<any> {
    if (mods["mods:modsCollection"]["mods:mods"][0]["mods:originInfo"] && mods["mods:modsCollection"]["mods:mods"][0]["mods:originInfo"][0]) {
        const originInfo = mods["mods:modsCollection"]["mods:mods"][0]["mods:originInfo"][0];
        // console.log('originInfo', JSON.stringify(originInfo, null, 2));

        if (!originInfo) return {'txt': '', 'bibtex': ''}; // Pokud nejsou k dispozici žádné nakladatelské údaje, vrátíme prázdný řetězec.

        // Získání místa vydání (první místo, kde není authority "marccountry")
        const places = originInfo["mods:place"];
        let placeOfPublication = '';

        if (places) {
            // Najdeme první místo bez authority "marccountry"
            const relevantPlace = places.find((place: any) => place["mods:placeTerm"][0]?.$?.authority !== "marccountry");
            if (relevantPlace) {
                placeOfPublication = relevantPlace["mods:placeTerm"][0]?._ || '';
                if (placeOfPublication.startsWith('[') && !placeOfPublication.endsWith(']')) {
                    placeOfPublication = placeOfPublication + ']';
                }
            }
        }

        // Získání vydavatele
        let publishers = originInfo["mods:publisher"];
        let publisher = '';
        if (publishers && publishers.length > 0) {
            publisher = publishers[0] || '';
            if (publisher && publisher.startsWith('[') && !publisher.endsWith(']')) {
                publisher = publisher + ']';
            }
        }

        // Získání roku vydání
        const dateIssued = originInfo["mods:dateIssued"] || '';
        let dateIssuedString = '';
        let dateIssuedStringStart = '';
        let dateIssuedStringEnd = '';
        if (dateIssued.length === 1) {
            dateIssuedString = dateIssued[0]; // Odstraníme mezery na začátku a konci
        } else if (dateIssued.length > 1) {
            dateIssued.forEach((date: any) => {
                if (date && date?.$?.encoding === 'marc') {
                    if (date?.$?.point === 'start') {
                        console.log('dateStart', date);
                        dateIssuedStringStart = date._.trim() || '';
                    } else if (date?.$?.point === 'end') {
                        dateIssuedStringEnd = date._.trim() || '';
                    } else {
                        dateIssuedString = date._.trim() || '';
                    }
                }
            });
        }
        const otherDate = originInfo["mods:dateOther"] || '';
        let dateIssuedStringOther = '';
        if (otherDate.length > 0) {
            dateIssuedStringOther = otherDate[0]._?.trim();
        }

        // Získání edice (volitelné)
        const edition = originInfo["mods:edition"] || '';

        // Vytvoření výsledného řetězce
        let txt = '';
        let bibtex = '';

        if (edition) {
            txt += `${edition[0].trim()}`; // Odstraníme mezery na začátku a konci
            bibtex += `edition = {${edition[0].trim()}}, `; // Odstraníme mezery na začátku a konci
            if (!txt.endsWith('.')) {
                txt += '.'; // Přidáme tečku, pokud řetězec nekončí tečkou
            }
            txt += ' '; // Přidáme mezeru po tečce
        }

        if (placeOfPublication && placeOfPublication.length > 0) {
            txt += `${placeOfPublication}`;
            if (publisher && publisher.length > 0) {
                txt += `: `;
            }
            bibtex += `address = {${placeOfPublication}}, `;
        }

        if (publisher && publisher.length > 0) {
            txt += `${publisher}`;
            bibtex += `publisher = {${publisher}}, `;
        }

        if (dateIssuedString && dateIssuedString.length > 0) {
            if ((publisher && publisher.length > 0) || (placeOfPublication && placeOfPublication.length > 0)) {
                txt += `, ${dateIssuedString}.`;
            } else {
                txt += `${dateIssuedString}.`;
            }
            bibtex += `year = {${dateIssuedString}}, `;
        } else if (dateIssuedStringStart || dateIssuedStringEnd) {
            console.log('dateIssuedStringStart', dateIssuedStringStart);
            if ((publisher && publisher.length > 0) || (placeOfPublication && placeOfPublication.length > 0)) {
                txt += `, ${dateIssuedStringStart}-${dateIssuedStringEnd}.`;
                console.log('txt', txt);
            } else {
                txt += `${dateIssuedStringStart}-${dateIssuedStringEnd}.`;
                console.log('txt', txt);
            }
            bibtex += `year = {${dateIssuedStringStart}-${dateIssuedStringEnd}}, `;
        } else if (dateIssuedStringOther && dateIssuedStringOther.length > 0) {
            if ((publisher && publisher.length > 0) || (placeOfPublication && placeOfPublication.length > 0)) {
                txt += `, ${dateIssuedStringOther}.`;
            } else {
                txt += `${dateIssuedStringOther}.`;
            }
            bibtex += `year = {${dateIssuedStringOther}}, `;
        } 
        // else {
        //     txt += '.';
        // }
        // Pokud nemáme žádná data, vrátíme prázdný řetězec, jinak vrátíme výsledek
        return {'txt': txt.trim() ? txt : '', 
                'bibtex': bibtex };
    } else {
        return {'txt': '', 'bibtex': ''};
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

export function parsePhysicalDescription(mods: any, lang: any): string {
    let physicalDescription: string = '';
    const physicalDescriptions = mods["mods:modsCollection"]["mods:mods"][0]["mods:physicalDescription"];

    if (!physicalDescriptions) return ''; // Pokud nejsou žádné fyzické popisy, vrátíme prázdný řetězec

    physicalDescriptions.forEach((physicalDescriptionObj: any) => {
        // Získání fyzického popisu
        const extent = physicalDescriptionObj["mods:extent"] || '';
        // const form = physicalDescriptionObj["mods:form"] || '';

        if (extent) {
            physicalDescription += (`${extent}`);
        }
        // if (form) {
        //     physicalDescription += (` ${form}`);
        // }
    });
    if (String(physicalDescription).endsWith('.')) {
        return physicalDescription;
    } else {
        return physicalDescription + '.';
    }
    console.log('physicalDescription', physicalDescription);

    return physicalDescription;
}


