import { Request, Response } from 'express';
import axios from 'axios';
import { getLocale } from '../locales';
import { parseStringPromise } from 'xml2js';
import { parseModsAuthors, parseModsTitles, parseModsPublisher } from './modsParser';

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

  const mods_url = `${baseUrl}/search/api/client/v7.0/items/${uuid}/metadata/mods`;
  
  console.log('Fetching data', url, mods_url);
  try {
    const response = await axios.get(url);
    const mods_response = await axios.get(mods_url);
    const parsedMods = await parseStringPromise(mods_response.data, { explicitArray: false });
    return [response.data, parsedMods];
  } catch (error) {
    throw new Error('Data not found or error in fetching data'); 
  }
}

// Hlavní funkce pro získání citace
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
    const responce = await generateCitation(data, lang as string, dlUrl);
    const citation = responce[0];
    const apiSource = responce[1];
    const modsSource = responce[2];
    if (!format) {
      return res.status(200).json({ citation, apiSource, modsSource });
    } else {
      return res.status(200).json(citation[String(format)]);
    }
    // return res.status(200).json({ citation, source });
  } catch (error) {
    return res.status(500).json({ error: (error as any).message });
  }
}

// Generování citace
async function generateCitation(data: any, lang: string, dlUrl: string): Promise<any> {
  const locale = getLocale(lang);

  let citation: { html: string, txt: string } = { html: '', txt: '' };
  const apiData = data[0].response?.docs?.[0];
  const modsData = data[1];

  // Zpracování autorů, titulu, vydavatele atd.
  const authors = await parseModsAuthors(modsData, lang);
  const title = await parseModsTitles(modsData, lang);
  const publication = await parseModsPublisher(modsData, lang);
  const availibility = locale['available'] + dlUrl + apiData['own_pid_path'] || '';
  // https://www.digitalniknihovna.cz/mzk/uuid/uuid:869e4730-6c8b-11e2-8ed6-005056827e52

  citation.txt += `${authors} ${title}. ${publication} ${availibility}`;
  citation.html += `<div>${authors} <i>${title}.</i> ${publication} ${availibility} </div>`;

  return [citation, apiData, modsData];
}




