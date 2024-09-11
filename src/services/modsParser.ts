
// Funkce pro zpracování MODS autorů
export async function parseModsAuthors(mods: any, lang: any): Promise<string> {
  const authorsList: string[] = [];

  let names = mods["mods:modsCollection"]["mods:mods"]["mods:name"];
  console.log("Names", names);

  // Pokud je to jediný objekt, zabalíme ho do pole
  if (names && !Array.isArray(names)) {
    names = [names];
  }
  if (!names) return "";

  names.forEach((name: any) => {
    // Ověření, že namePart existuje a je polem
    const nameParts = name['mods:namePart'];
    if (!nameParts || !Array.isArray(nameParts)) return;

    let family = '';
    let given = '';
    let fullName = '';

    nameParts.forEach((part: any) => {
      if (typeof part === 'string') {
        // Pokud je part řetězec, bereme ho jako celé jméno
        fullName = part;
        family = fullName.split(', ')[0];
        given = fullName.split(', ')[1];
      } else if (part.$?.type === 'family') {
        family = part._;
      } else if (part.$?.type === 'given') {
        given = part._;
      }
    });

    if (family || given) {
      // Pokud máme příjmení a jméno
      authorsList.push(`${family.toUpperCase() || ''}, ${given || ''}`.trim());
    }
  });

  if (authorsList.length === 0) return '';
  if (authorsList.length === 1) return `${authorsList[0]}.`;
  if (authorsList.length > 4) return `${authorsList[0]} et al.`;
  return `${authorsList.slice(0, -1).join(', ')} a ${authorsList[authorsList.length - 1]}.`;
}

export async function parseModsTitles(mods: any, lang: any): Promise<string> {
    const titlesList: string[] = [];
    const titleInfo = mods["mods:modsCollection"]["mods:mods"]["mods:titleInfo"];

    if (!titleInfo) return ''; // Pokud nejsou k dispozici žádné tituly, vrátíme prázdný řetězec.

    // Získání hlavního titulu
    const title = titleInfo["mods:title"] || '';

    // Získání podnázvu (volitelné)
    const subTitle = titleInfo["mods:subTitle"] || '';

    // Pokud máme podnázev, vrátíme formát 'Název: podnázev', jinak jen 'Název'
    if (subTitle) {
        return `${title}: ${subTitle}`;
    }

    return title;
}

export async function parseModsPublisher(mods: any, lang: any): Promise<string> {
    const originInfo = mods["mods:modsCollection"]["mods:mods"]["mods:originInfo"];

    if (!originInfo) return ''; // Pokud nejsou k dispozici žádné nakladatelské údaje, vrátíme prázdný řetězec.

    // Získání místa vydání (první místo, kde není authority "marccountry")
    const places = originInfo["mods:place"];
    let placeOfPublication = '';

    if (places && Array.isArray(places)) {
        // Najdeme první místo bez authority "marccountry"
        const relevantPlace = places.find((place: any) => place["mods:placeTerm"]?.$?.authority !== "marccountry");
        if (relevantPlace) {
            placeOfPublication = relevantPlace["mods:placeTerm"]?._ || '';
        }
    }

    // Získání vydavatele
    const publisher = originInfo["mods:publisher"] || '';

    // Získání roku vydání
    const dateIssued = originInfo["mods:dateIssued"] || '';

    // Vytvoření výsledného řetězce
    let result = '';

    if (placeOfPublication) {
        result += `${placeOfPublication}: `;
    }

    if (publisher) {
        result += `${publisher}`;
    }

    if (dateIssued) {
        result += `, ${dateIssued}.`;
    }

    // Pokud nemáme žádná data, vrátíme prázdný řetězec, jinak vrátíme výsledek
    return result.trim() ? result : '';
}



