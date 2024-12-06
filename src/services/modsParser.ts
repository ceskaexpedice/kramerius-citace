import e from 'express';
import { getLocale } from '../locales';
import { parse } from 'path';
import { title } from 'process';

// Funkce pro zpracování MODS autorů
export async function parseModsAuthors(mods: any, lang: any): Promise<any> {
  let locale = getLocale(lang);
  const authorsList: string[] = [];
  const authorsListIso: string[] = [];

  let names;
  if (mods["mods:modsCollection"]) {
    names = mods["mods:modsCollection"]["mods:mods"][0]["mods:name"];
  } else {
    names = mods["modsCollection"]["mods"][0]["name"];
  }
  console.log('names', names);

  if (!names) return {'iso': '', 'mla': '', 'bibtex': '', 'wiki': '', 'ris': ''}; // Pokud nejsou žádní autoři, vrátíme prázdný řetězec

  let wikiAuthors = '';
  let risAuthors = '';

  let i = 1;

  names.forEach((name: any) => {
    // Ověření, že namePart existuje a je polem
    // vyfiltruji names, ktere neobsahuji nameTitleGroup (uniformni jmeno)
    if (!name.$?.nameTitleGroup) {
        const namePart = name['mods:namePart'];
        if (!namePart || !Array.isArray(namePart)) return;
        
        // index


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
            authorsListIso.push(`${family.toUpperCase() || ''}, ${given || ''}`.trim());
            authorsList.push(`${family}, ${given}`.trim());
            risAuthors += `AU  - ${family}, ${given}\n`;
            if (i === 1) {
                wikiAuthors += `${locale['wiki']['surname']} = ${family} | ${locale['wiki']['name']} = ${given} | `;
            } else {
                wikiAuthors += `${locale['wiki']['surname']}${i} = ${family} | ${locale['wiki']['name']}${i} = ${given} | `;
            } 
        } else if (family.length > 0 || given.length > 0) {
            // Pokud máme pouze jedno z nich
            authorsListIso.push(`${family || given}`.trim());
            authorsList.push(`${family || given}`.trim());
            risAuthors += `AU  - ${family || given}\n`;
            if (i === 1) {
                wikiAuthors += `${locale['wiki']['surname']} = ${family || given} | `;
            } else {
                wikiAuthors += `${locale['wiki']['surname']}${i} = ${family || given} | `;
            }
        }
        i = i + 1;
    }
  });

  if (authorsList.length === 0) return {'iso': '', 'mla': '', 'bibtex': '', 'wiki': '', 'ris': ''}; // Pokud nejsou žádní autoři, vrátíme prázdný řetězec
  if (authorsList.length === 1) return {'iso': `${authorsListIso[0]}.`,
                                        'mla': `${authorsList[0]}.`,
                                        'bibtex': `${authorsList[0]}`, 
                                        'wiki': wikiAuthors, 
                                        'ris': risAuthors};
  if (authorsList.length === 2) return {'iso':`${authorsListIso.slice(0, -1).join(', ')}` + ' ' + locale['and'] + ' ' + `${authorsListIso[authorsList.length - 1]}.`,
                                        'mla':`${authorsList.slice(0, -1).join(', ')}` + ' ' + locale['and'] + ' ' + `${authorsList[authorsList.length - 1]}.`,
                                        'bibtex':`${authorsList.slice().join(' and ')}`,
                                        'wiki': wikiAuthors,
                                        'ris': risAuthors};;
  if (authorsList.length === 3 || authorsList.length === 4) return {'iso':`${authorsListIso.slice(0, -1).join(', ')}` + ' ' + locale['and'] + ' ' + `${authorsListIso[authorsList.length - 1]}.`,
                                                                  'mla':`${authorsList[0]}, et al.`,
                                                                  'bibtex':`${authorsList.slice().join(' and ')}`,
                                                                  'wiki': wikiAuthors,
                                                                  'ris': risAuthors};
  if (authorsList.length > 4) return {'iso': `${authorsListIso[0]} et al.`,
                                      'mla':`${authorsList[0]}, et al.`,
                                      'bibtex': `${authorsList[0]} and others`, 
                                      'wiki': wikiAuthors, 
                                      'ris': risAuthors};
  
}

// ================== PARSE MODS TITLES ==================

export async function parseModsTitles(mods: any, lang: any): Promise<any> {
    let locale = getLocale(lang);
    let titlesList: string = '';
    
    let titleInfo;
    if (mods["mods:modsCollection"]) {
        titleInfo = mods["mods:modsCollection"]["mods:mods"][0]["mods:titleInfo"];
    } else {
        titleInfo = mods["modsCollection"]["mods"][0]["titleInfo"];
    }

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
                titlesList += (`${title}`);
            }
            if (subTitle && String(subTitle).length > 0) {
                // console.log('subTitle', subTitle);
                titlesList += (`: ${subTitle}`);
            } else if (String(title).length > 0) {
                if (!String(titlesList).endsWith('.')) {
                    titlesList += ('.');
                }
            }
            if (partNumber && String(partNumber).length > 0) {
                if (!String(partNumber).startsWith('Díl') && !String(partNumber).startsWith('díl') && !String(partNumber).startsWith('část') && !String(partNumber).startsWith('Část')) {
                    titlesList += (` ${locale['part']} ${partNumber}`);
                } else {
                    titlesList += (` ${partNumber}`);
                }
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
    // Vrátíme všechny části názvu spojené dohromady
    
    return { 'txt': titlesList, 'wiki': `${locale['wiki']['title']} = ${titlesList} | `, 'ris': `TI  - ${titlesList}\n` };
}

// ================== PARSE PERIODICAL TITLE ==================

export async function parsePeriodicalTitle(mods: any, apiData: any, lang: any): Promise<any> {
    let titleName = apiData['root.title'] || '';
    let issueDate = '';
    let articleName = '';
    let partName = '';

    if (apiData['model'] === 'periodicalitem') {
        issueDate = apiData['date.str'] || '';
        return [titleName, issueDate];
    }
    if (apiData['model'] === 'supplement') {
        titleName += `. ${apiData['title.search'].trim()}`;
        return [titleName];
    }
    if (apiData['model'] === 'internalpart') {
        partName = apiData['title.search'].trim() || '';
        return [titleName, issueDate, partName, 'In:'];
    }
    if (apiData['model'] === 'soundunit' || apiData['model'] === 'track') {
        partName = apiData['title.search'].trim() || '';
        return [partName];
    }
    if (apiData['model'] === 'article') {
        issueDate = apiData['date.str'] || '';
        articleName = apiData['title.search'].trim() || '';
        return [titleName, issueDate, articleName];
    } else {
        return [titleName]; 
    }
}

// ================== PARSE PERIODICAL PUBLISHER ==================

export async function parsePeriodicalPublisher(modsData: any, 
                                               apiData: any, 
                                               lang: any, 
                                               apiDataTitle: any, 
                                               modsTitle: any, 
                                               apiDataVolume?: any, 
                                               modsVolume?: any, 
                                               apiDataIssue?: any, 
                                               modsIssue?: any, 
                                               pageNumber?: any): Promise<any> {
    let locale = getLocale(lang);
    let publicationData;
    if (modsTitle["mods:modsCollection"]) {
        publicationData = modsTitle["mods:modsCollection"]["mods:mods"][0]["mods:originInfo"][0];
    } else {
        publicationData = modsTitle["modsCollection"]["mods"][0]["originInfo"][0];
    }
    let publisher = '';
    let placeOfPublication = '';
    let volume = '';
    let volumeDate = '';
    let issue = '';
    let issueDate = '';
    let articlePageStart = '';
    let articlePageEnd = '';
    let dateIssuedString = '';
    let dateIssuedStringStart = '';
    let dateIssuedStringEnd = '';

    if (publicationData) {
        // console.log('publicationData', JSON.stringify(publicationData, null, 2));
        // Získání místa vydání (první místo, kde není authority "marccountry")
        let places;
        if (publicationData["mods:place"]) {
            places = publicationData["mods:place"];
        } else {
            places = publicationData["place"];
        }
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
        let dateIssued = publicationData["mods:dateIssued"] || '';
        console.log('dateIssued', dateIssued);
        if (dateIssued.length === 1) {
            console.log('dateIssued', dateIssued[0]);
            if (dateIssued[0]?._) {
                dateIssuedString = dateIssued[0]?._;
            } else {
                dateIssuedString = dateIssued[0];
            }
        } else if (dateIssued.length > 1) {
            dateIssued.forEach((date: any) => {
                if (date && date?.$?.encoding === 'marc') {
                    if (date?.$?.point === 'start') {
                        dateIssuedStringStart = date._.trim() || '';
                    } else if (date?.$?.point === 'end') {
                        dateIssuedStringEnd = date._.trim() || '';
                    } else {
                        dateIssuedString = date._.trim() || '';
                    }
                }
            });
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
    if (apiData['model'] === 'supplement') {
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
        if (modsData["mods:modsCollection"]["mods:mods"][0]["mods:relatedItem"]?.[0]?.["mods:part"]?.[0]?.["mods:extent"]?.[0]?.["mods:start"]?.[0]) {
            articlePageStart = modsData["mods:modsCollection"]["mods:mods"][0]["mods:relatedItem"]?.[0]?.["mods:part"]?.[0]?.["mods:extent"]?.[0]?.["mods:start"]?.[0] || '';
        } else if (modsData["mods:modsCollection"]["mods:mods"][0]["mods:part"]?.[0]?.["mods:extent"]?.[0]?.["mods:start"]?.[0]) {
            articlePageStart = modsData["mods:modsCollection"]["mods:mods"][0]["mods:part"]?.[0]?.["mods:extent"]?.[0]?.["mods:start"]?.[0] || '';
        }
        if (modsData["mods:modsCollection"]["mods:mods"][0]["mods:relatedItem"]?.[0]?.["mods:part"]?.[0]?.["mods:extent"]?.[0]?.["mods:end"]?.[0]) {
            articlePageEnd = modsData["mods:modsCollection"]["mods:mods"][0]["mods:relatedItem"]?.[0]?.["mods:part"]?.[0]?.["mods:extent"]?.[0]?.["mods:end"]?.[0] || '';
        } else if (modsData["mods:modsCollection"]["mods:mods"][0]["mods:part"]?.[0]?.["mods:extent"]?.[0]?.["mods:end"]?.[0]) {
            articlePageEnd = modsData["mods:modsCollection"]["mods:mods"][0]["mods:part"]?.[0]?.["mods:extent"]?.[0]?.["mods:end"]?.[0] || '';
        }
    }
    // Získání dat o rozsahu stran kapitoly (internalpart)
    if (apiData['model'] === 'internalpart') {
        if (modsData["mods:modsCollection"]) {
            articlePageStart = modsData["mods:modsCollection"]["mods:mods"][0]["mods:part"]?.[0]?.["mods:extent"]?.[0]?.["mods:start"]?.[0] || '';
            articlePageEnd = modsData["mods:modsCollection"]["mods:mods"][0]["mods:part"]?.[0]?.["mods:extent"]?.[0]?.["mods:end"]?.[0] || '';
        } else {
            articlePageStart = modsData["modsCollection"]["mods"][0]["part"]?.[0]?.["extent"]?.[0]?.["start"]?.[0] || '';
            articlePageEnd = modsData["modsCollection"]["mods"][0]["part"]?.[0]?.["extent"]?.[0]?.["end"]?.[0] || '';
        }
    }

    // Vytvoření výsledného řetězce
    let iso = '';
    let mla = '';
    let bibtex = '';
    let wiki = '';
    let ris = '';
    if (placeOfPublication && placeOfPublication.length > 0) {
        iso += `${placeOfPublication}`;
        // mla 9 nepouziva misto vydani
        bibtex += `address = {${placeOfPublication}}, `;
        wiki += ` ${locale['wiki']['place']} = ${placeOfPublication} | `;
        ris += `PP  - ${placeOfPublication}\n`;
        if (publisher && publisher.length > 0) {
            iso += `: `;
        }
    }
    if (publisher && publisher.length > 0) {
        iso += `${publisher}`;
        // mla += `${publisher}`;
        bibtex += `publisher = {${publisher}}, `;
        wiki += `${locale['wiki']['publisher']} = ${publisher} | `;
        ris += `PB  - ${publisher}\n`;
    }
    if (volume && volume.length > 0) {
        iso += `, ${locale['volume']} ${volume}`;
        mla += `, ${locale['volume']} ${volume}`;
        bibtex += `volume = {${volume}}, `;
        wiki += `${locale['wiki']['volume']} = ${volume} | `;
        ris += `VL  - ${volume}\n`;
    }
    if (apiData['model'] === 'internalpart' || apiData['model'] === 'soundunit' || apiData['model'] === 'track') {
        console.log('internalpart', dateIssuedString);
        if (dateIssuedString && dateIssuedString.length > 0) {
            if (publisher && publisher.length > 0) {
                iso += `, ${dateIssuedString}`;
                mla += `, ${dateIssuedString}`;
            } else {
                iso += `${dateIssuedString}`;
                mla += `${dateIssuedString}`;
            }
            bibtex += `year = {${dateIssuedString}}, `;
            wiki += `${locale['wiki']['year']} = ${dateIssuedString} | `;
            ris += `PY  - ${dateIssuedString}\n`;
        } else if (dateIssuedStringStart || dateIssuedStringEnd) {
            iso += `, ${dateIssuedStringStart}-${dateIssuedStringEnd}`;
            mla += `, ${dateIssuedStringStart}-${dateIssuedStringEnd}`;
            bibtex += `year = {${dateIssuedStringStart}-${dateIssuedStringEnd}}, `;
            wiki += `${locale['wiki']['year']} = ${dateIssuedStringStart}-${dateIssuedStringEnd} | `;
            ris += `Y1  - ${dateIssuedStringStart}\nY2  - ${dateIssuedStringEnd}\n`;
        }
    } 
    if ( apiData['model'] === 'periodicalvolume' && volumeDate && volumeDate.length > 0 && volumeDate !== volume) {
        iso += ` (${volumeDate})`;
        if (!issue) {
            mla += `, ${volumeDate}`;
            bibtex += `date = {${volumeDate}}, `;
            wiki += `${locale['wiki']['year']} = ${volumeDate} | `;
            if (volumeDate.length === 4) {
                ris += `Y1  - ${volumeDate}\n`;
            } else {
                let dates = volumeDate.split('-');
                ris += `Y1  - ${dates[0]}\nY2  - ${dates[1]}\n`;
            }
        }
    }
    if (issue && issue.length > 0) {
        if (apiData['model'] === 'supplement') {
            iso += `, ${locale['supplement']} ${issue}`;
            mla += `, ${locale['supplement']} ${issue}`;
            bibtex += `number = {${issue}}, `;
            wiki += `${locale['wiki']['supplement']} = ${issue} | `;
            ris += `IS  - ${issue}\n`;
        } else {
            iso += `, ${locale['issue']} ${issue}`;
            mla += `, ${locale['issue']} ${issue}`;
            bibtex += `number = {${issue}}, `;
            wiki += `${locale['wiki']['issue']} = ${issue} | `;
            ris += `IS  - ${issue}\n`;
        }
    }
    if (issueDate && issueDate.length > 0 && issueDate !== issue) {
        mla += `${issueDate}`;
        bibtex += `date = {${issueDate}}, `;
        wiki += `${locale['wiki']['day']} = ${issueDate} | `;
        if (issueDate.length === 4) {
            ris += `Y1  - ${issueDate}\n`;
        } else {
            if (issueDate && issueDate.includes('-')) {
                let dates = issueDate.split('-');
                ris += `Y1  - ${dates[0]}\n`;
                if (dates && dates[1] && dates[1].length > 0) {
                    ris += `Y2  - ${dates[1]}\n`;
                } 
            }
            if (issueDate && issueDate.includes('.')) {
                let dates = issueDate.split('.');
                if (dates && dates.length === 3) {
                    ris += `Y1  - ${dates[2]}/${dates[1]}/${dates[0]}/\n`;
                }
            }
        }
    }
    if (articlePageStart && articlePageStart.length > 0) {
        iso += `, ${locale['page']} ${articlePageStart}`;
        mla += `, ${locale['page']} ${articlePageStart}`;
        bibtex += `pages = {${articlePageStart}`;
        wiki += `${locale['wiki']['pages']} = ${articlePageStart}`;
        ris += `SP  - ${articlePageStart}\n`;
        if (articlePageEnd && articlePageEnd.length > 0 && articlePageEnd !== articlePageStart) {
            iso += `-${articlePageEnd}.`;
            mla += `-${articlePageEnd}, `;
            bibtex += `--${articlePageEnd}},`;
            wiki += `-${articlePageEnd} | `;
            ris += `EP  - ${articlePageEnd}\n`;
        } else {
            bibtex += `},`;
            wiki += ` | `;
            ris += `EP  - ${articlePageStart}\n`;
        }
    } else if (pageNumber && pageNumber.length > 0) {
        iso += `, ${locale['page']} ${pageNumber}.`;
        mla += `, ${locale['page']} ${pageNumber}.`;
        bibtex += `, pages = {${pageNumber}}`;
        wiki += `${locale['wiki']['pages']} = ${pageNumber} | `;
        ris += `SP  - ${pageNumber}\n`;
        ris += `EP  - ${pageNumber}\n`;
    } else {
        iso += '.';
        mla += '.';
    }

    return {'iso': iso, 'mla': mla, 'bibtex': bibtex, 'wiki': wiki, 'ris': ris};
}

// ================== PARSE MODS PUBLISHER ==================

export async function parseModsPublisher(mods: any, lang: any, pageNumber?: string): Promise<any> {
    console.log('pageNumber', pageNumber);
    let locale = getLocale(lang);
    if (mods["mods:modsCollection"]["mods:mods"][0]["mods:originInfo"] && mods["mods:modsCollection"]["mods:mods"][0]["mods:originInfo"][0]) {
        const originInfo = mods["mods:modsCollection"]["mods:mods"][0]["mods:originInfo"][0];

        if (!originInfo) return {'iso': '', 'mla': '', 'bibtex': '', 'wiki': '', 'ris': ''}; // Pokud nejsou k dispozici žádné nakladatelské údaje, vrátíme prázdný řetězec.

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
            if (publisher && publisher.endsWith(']') && !publisher.startsWith('[')) {
                publisher = '[' + publisher;
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
        let iso = '';
        let mla = '';
        let bibtex = '';
        let wiki = '';
        let ris = '';

        if (edition) {
            iso += `${edition[0].trim()}`; // Odstraníme mezery na začátku a konci
            bibtex += `edition = {${edition[0].trim()}}, `; // Odstraníme mezery na začátku a konci
            wiki += `${locale['wiki']['edition']} = ${edition[0].trim()} | `;
            ris += `ET  - ${edition[0].trim()}\n`;
            if (!iso.endsWith('.')) {
                iso += '.'; // Přidáme tečku, pokud řetězec nekončí tečkou
            }
            iso += ' '; // Přidáme mezeru po tečce
        }

        if (placeOfPublication && placeOfPublication.length > 0) {
            iso += `${placeOfPublication}`;
            // mla += `${placeOfPublication}`; ve verzi 9 se nepouziva misto vydani
            if (publisher && publisher.length > 0) {
                iso += `: `;
            }
            bibtex += `address = {${placeOfPublication}}, `;
            wiki += `${locale['wiki']['place']} = ${placeOfPublication} | `;
            ris += `PP  - ${placeOfPublication}\n`;
        } 
        // else {
        //     mla += 'N.p.';
        //     if (publisher && publisher.length > 0) {
        //         mla += `: `;
        //     }
        // }

        if (publisher && publisher.length > 0) {
            iso += `${publisher}`;
            mla += `${publisher}`;
            bibtex += `publisher = {${publisher}}, `;
            wiki += `${locale['wiki']['publisher']} = ${publisher} | `;
            ris += `PB  - ${publisher}\n`;
        }

        if (dateIssuedString && dateIssuedString.length > 0) {
            if ((publisher && publisher.length > 0) || (placeOfPublication && placeOfPublication.length > 0)) {
                iso += `, ${dateIssuedString}`;
                mla += `, ${dateIssuedString}`;
            } else {
                iso += `${dateIssuedString}`;
                mla += `${dateIssuedString}`;
            }
            bibtex += `year = {${dateIssuedString}}, `;
            wiki += `${locale['wiki']['year']} = ${dateIssuedString} | `;
            ris += `PY  - ${dateIssuedString}\n`;
        } else if (dateIssuedStringStart || dateIssuedStringEnd) {
            if ((publisher && publisher.length > 0) || (placeOfPublication && placeOfPublication.length > 0)) {
                iso += `, ${dateIssuedStringStart}-${dateIssuedStringEnd}`;
                mla += `, ${dateIssuedStringStart}-${dateIssuedStringEnd}`;
            } else {
                iso += `${dateIssuedStringStart}-${dateIssuedStringEnd}`;
                mla += `${dateIssuedStringStart}-${dateIssuedStringEnd}`;
            }
            bibtex += `year = {${dateIssuedStringStart}-${dateIssuedStringEnd}}, `;
            wiki += `${locale['wiki']['year']} = ${dateIssuedStringStart}-${dateIssuedStringEnd} | `;
            ris += `Y1  - ${dateIssuedStringStart}\nY2  - ${dateIssuedStringEnd}\n`;
        } else if (dateIssuedStringOther && dateIssuedStringOther.length > 0) {
            if ((publisher && publisher.length > 0) || (placeOfPublication && placeOfPublication.length > 0)) {
                iso += `, ${dateIssuedStringOther}`;
                mla += `, ${dateIssuedStringOther}`;
            } else {
                iso += `${dateIssuedStringOther}`;
                mla += `${dateIssuedStringOther}`;
            }
            bibtex += `year = {${dateIssuedStringOther}}, `;
            wiki += `${locale['wiki']['year']} = ${dateIssuedStringOther} | `;
            ris += `PY  - ${dateIssuedStringOther}\n`;
        }

        if (pageNumber && pageNumber.length > 0) {
            console.log('pageNumber', pageNumber);
            iso += `, ${locale['page']} ${pageNumber}.`;
            mla += `, ${locale['page']} ${pageNumber}.`;
            bibtex += `pages = {${pageNumber}}`;
        } else {
            iso += '.';
            mla += '.';
        }

        // Pokud nemáme žádná data, vrátíme prázdný řetězec, jinak vrátíme výsledek
        return {'iso': iso.trim() ? iso : '',
                'mla': mla.trim() ? mla : '',
                'bibtex': bibtex,
                'wiki': wiki,
                'ris': ris};
    } else {
        return {'iso': '', 'bibtex': '', 'wiki': '', 'ris': ''};
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

export function parseDoi(mods: any): string {
    let doi: string = '';
    const identifiers = mods["mods:modsCollection"]["mods:mods"][0]["mods:identifier"];

    if (!identifiers) return ''; // Pokud nejsou žádné identifikátory, vrátíme prázdný řetězec

    identifiers.forEach((identifierObj: any) => {
        if (identifierObj?.$?.type === 'doi') {
            doi = identifierObj._ || '';
        }
    });

    return doi;
}



