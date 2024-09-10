import { Request, Response } from 'express';
import axios from 'axios';

const KRAMERIUS_URLS = {
  default: 'https://api.kramerius.mzk.cz',
  nkp: 'https://kramerius5.nkp.cz'
};

// Funkce pro stažení dat přes API
async function fetchItemData(baseUrl: string, uuid: string, k7: boolean) {
  const url = k7
    ? `${baseUrl}/search/api/client/v7.0/search?q=pid:%22${uuid}%22&rows=1`
    : `${baseUrl}/search/api/v5.0/item/${uuid}`;
  
  console.log('Fetching data', url);
  try {
    const response = await axios.get(url);
    console.log('Data fetched successfully', response.data);
    return response.data;
  } catch (error) {
    throw new Error('Data not found or error in fetching data'); 
  }
}

// Generování citace
function generateCitation(data: any, lang: string): any {
  let citation: { html: string, plain: string } = { html: '', plain: '' };
  const apiData = data?.response?.docs?.[0];
  console.log('Generating citation', data.response.docs[0]);

  // Zpracování autorů, titulu, vydavatele atd.
  const authors = getAuthors(apiData);
  const title = apiData['title.search'] || 'Unknown title';
  const place = apiData['publication_places.search'] || 'Unknown place';
  const publisher = apiData['publishers.search'] || 'Unknown publisher';
  const year = apiData['date_range_start.year'] || 'Unknown year';

  citation.plain += `${authors}. ${title}. ${place}: ${publisher}, ${year}.`;
  citation.html += `<div><b>${authors}.</b> <i>${title}.</i> ${place}: ${publisher}, ${year}. </div>`;

  return [citation, data];
}

// AUTORI
function getAuthors(data: any): string {
  let authorsData = data['authors.search'] || [];
  
  if (authorsData.length === 0) {
    return '';
  } else {
    const authors = authorsData.map((author: any) => {
      let authorSurname = author.split(',')[0].toUpperCase();
      let authorName = author.split(',')[1].trim();
      return `${authorSurname}, ${authorName}`;
    }).join('; ');
    
    return authors;
  }
}

// Hlavní funkce
export async function getCitation(req: Request, res: Response) {
  const { uuid, url, lang = 'cs', k7 = 'true', form } = req.query;
  console.log('Request params', req.query);

  if (!uuid) {
    return res.status(422).json({ error: 'Missing uuid parameter' });
  }

  const baseUrl = url || KRAMERIUS_URLS.default;

  try {
    const data = await fetchItemData(baseUrl as string, uuid as string, k7 === 'true');
    const citation = generateCitation(data, lang as string)[0];
    const context = generateCitation(data, lang as string)[1];
    return res.status(200).json({ citation, context });
  } catch (error) {
    return res.status(500).json({ error: (error as any).message });
  }
}
