import { Request, Response } from 'express';
import axios from 'axios';

import { getLocale } from '../locales';

const KRAMERIUS_API_URLS = {
  default: 'https://api.kramerius.mzk.cz',
  nkp: 'https://kramerius5.nkp.cz'
};

const DL_URLS = {
  default: 'https://www.digitalniknihovna.cz/mzk/uuid/'
};


// Funkce pro stažení dat přes API
async function fetchItemData(baseUrl: string, uuid: string, k7: boolean) {
  const url = k7
    ? `${baseUrl}/search/api/client/v7.0/search?q=pid:%22${uuid}%22&rows=1`
    : `${baseUrl}/search/api/v5.0/item/${uuid}`;
  
  console.log('Fetching data', url);
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error('Data not found or error in fetching data'); 
  }
}

// Generování citace
function generateCitation(data: any, lang: string, dlUrl: string): any {
  const locale = getLocale(lang);

  let citation: { html: string, txt: string } = { html: '', txt: '' };
  const apiData = data?.response?.docs?.[0];

  // Zpracování autorů, titulu, vydavatele atd.
  const authors = getAuthors(apiData, lang);
  const title = apiData['title.search'] || 'Unknown title';
  const place = apiData['publication_places.search'] || 'Unknown place';
  const publisher = apiData['publishers.search'] || 'Unknown publisher';
  const year = apiData['date_range_start.year'] || 'Unknown year';
  const availibility = locale['available'] + dlUrl + apiData['own_pid_path'] || '';
  // https://www.digitalniknihovna.cz/mzk/uuid/uuid:869e4730-6c8b-11e2-8ed6-005056827e52

  citation.txt += `${authors}. ${title}. ${place}: ${publisher}, ${year}. ${availibility}`;
  citation.html += `<div>${authors}. <i>${title}.</i> ${place}: ${publisher}, ${year}. ${availibility} </div>`;

  return [citation, apiData];
}

// AUTORI
function getAuthors(data: any, lang: string): string {
  let authorsData = data['authors.search'] || [];
  const locale = getLocale(lang);

  if (authorsData.length === 0) {
    return '';
  } else {
    // Pokud je autorů více než 5, použij prvních 5 a přidej "et al."
    if (authorsData.length > 5) {
      const limitedAuthors = authorsData.slice(0, 5).map((author: any) => {
        let authorSurname = author.split(',')[0].toUpperCase();
        let authorName = author.split(',')[1].trim();
        return `${authorSurname}, ${authorName}`;
      }).join(', ');
      
      return `${limitedAuthors}, et al.`;
    } else {
      // Pro méně než 6 autorů vlož "a" mezi posledního a předposledního
      const authors = authorsData.map((author: any) => {
        let authorSurname = author.split(',')[0].toUpperCase();
        let authorName = author.split(',')[1].trim();
        return `${authorSurname}, ${authorName}`;
      });

      // Vložíme "a" mezi posledního a předposledního autora
      if (authors.length > 1) {
        const lastAuthor = authors.pop();
        return `${authors.join(', ')} ${locale['and']} ${lastAuthor}`;
      } else {
        // Pokud je pouze jeden autor
        return authors[0];
      }
    }
  }
}


// Hlavní funkce
export async function getCitation(req: Request, res: Response) {
  const { uuid, url, lang = 'cs', k7 = 'true', format = '' } = req.query;
  console.log('Request params', req.query);

  if (!uuid) {
    return res.status(422).json({ error: 'Missing uuid parameter' });
  }

  const baseUrl = url || KRAMERIUS_API_URLS.default;
  const dlUrl = DL_URLS.default;

  try {
    const data = await fetchItemData(baseUrl as string, uuid as string, k7 === 'true');
    const responce = generateCitation(data, lang as string, dlUrl);
    const citation = responce[0];
    const source = responce[1];
    if (!format) {
      return res.status(200).json({ citation, source });
    } else {
      return res.status(200).json(citation[String(format)]);
    }
    // return res.status(200).json({ citation, source });
  } catch (error) {
    return res.status(500).json({ error: (error as any).message });
  }
}
