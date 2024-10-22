import { Request, Response } from 'express';
import axios from 'axios';
import { getLocale } from '../locales';
import { parseStringPromise } from 'xml2js';
import { parseModsAuthors, parseModsTitles, parseModsPublisher, parseModsCartographics, parsePhysicalDescription, parsePeriodicalTitle, parsePeriodicalPublisher } from './modsParser';

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
    const parsedMods = await parseStringPromise(mods_response.data, { explicitArray: true });
    return [response.data, parsedMods];
  } catch (error) {
    throw new Error('Data not found or error in fetching data'); 
  }
}

// Hlavní funkce pro získání metadat a vraceni citace
export async function getCitation(req: Request, res: Response) {
  const { uuid, url, lang = 'cs', k7 = 'true', format = '' } = req.query;
  // console.log('Request params', req.query);

  if (!uuid) {
    return res.status(422).json({ error: 'Missing uuid parameter in format "uuid={uuid}"' });
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
    console.log('Error', error);
    return res.status(500).json({ error: (error as any).message });
  }
}

// Generování citace
async function generateCitation(data: any, lang: string, dlUrl: string): Promise<any> {
  const locale = getLocale(lang);

  let citation: { html?: string, txt?: string, bibtex?: string } = { html: '', txt: '', bibtex: '' };
  const apiData = data[0].response?.docs?.[0];
  const modsData = data[1];
  const model = apiData['model'];
  let authors;
  let title;
  let publication;
  let isbn;
  let issn;
  let availibility;
  let scale;
  let physicalDesc;

  // MONOGRAFICKE DOKUMENTY

  if (model === 'monograph' || 
      model === 'convolute' || 
      model === 'monographunit' || 
      model === 'map'|| 
      model === 'graphic' ||
      model === 'sheetmusic' ||
      model === 'archive' ||
      model === 'manuscript' ||
      model === 'periodical') {
    authors = await parseModsAuthors(modsData, lang);
    console.log('Authors', authors);
    title = await parseModsTitles(modsData, lang);
    publication = await parseModsPublisher(modsData, lang);
    console.log('Publication', publication);
    scale = await parseModsCartographics(modsData, lang);
    physicalDesc = await parsePhysicalDescription(modsData, lang);
    if (apiData['id_isbn'] !== undefined) {
      isbn = 'ISBN ' + apiData['id_isbn'][0] + '.' || '';
    }
    if (apiData['id_issn'] !== undefined) {
      issn = 'ISSN ' + apiData['id_issn'][0] + '.' || '';
    }
    availibility = dlUrl + apiData['pid'] || '';
  }
  // PERIODIKA

  // Periodical VOLUME
  if (model === 'periodicalvolume') {
    const baseUrl = KRAMERIUS_API_URLS.default;
    const k7 = true;
    
    // Získání dat o nadřazeném titulu
    let titleRequest = await fetchItemData(baseUrl, apiData['root.pid'], k7);
    let apiDataTitle = titleRequest[0].response.docs[0];
    let modsTitle = titleRequest[1];

    // Vygenerování částí citace    
    title = await parsePeriodicalTitle(modsData, apiData, lang);
    publication = await parsePeriodicalPublisher(modsData, apiData, lang, apiDataTitle, modsTitle);
    if (apiDataTitle['id_issn'] !== undefined) {
      issn = 'ISSN ' + apiDataTitle['id_issn'][0] + '.' || '';
    }
    availibility = dlUrl + apiData['pid'] || '';
  }

  // Periodical ISSUE
  if (model === 'periodicalitem') {
    const baseUrl = KRAMERIUS_API_URLS.default;
    const k7 = true;
    
    // Získání dat o nadřazeném titulu
    let titleRequest = await fetchItemData(baseUrl, apiData['root.pid'], k7);
    let apiDataTitle = titleRequest[0].response.docs[0];
    let modsTitle = titleRequest[1];
    // Získání dat o nadřazeném volume
    let volumeUUID = apiData['own_parent.pid'];
    let volumeRequest = await fetchItemData(baseUrl, volumeUUID, k7);
    let apiDataVolume = volumeRequest[0].response.docs[0];
    let modsVolume = volumeRequest[1];

    // Vygenerování částí citace
    title = await parsePeriodicalTitle(modsData, apiData, lang);
    publication = await parsePeriodicalPublisher(modsData, apiData, lang, apiDataTitle, modsTitle, apiDataVolume, modsVolume);
    if (apiDataTitle['id_issn'] !== undefined) {
      issn = 'ISSN ' + apiDataTitle['id_issn'][0] + '.' || '';
    }
    availibility = dlUrl + apiData['pid'] || '';
  }

  // Periodical ARTICLE
  if (model === 'article') {
    const baseUrl = KRAMERIUS_API_URLS.default;
    const k7 = true;
    
    // Získání dat o nadřazeném titulu
    let titleRequest = await fetchItemData(baseUrl, apiData['root.pid'], k7);
    let apiDataTitle = titleRequest[0].response.docs[0];
    let modsTitle = titleRequest[1];
    // Získání dat o nadřazeném issue
    let issueUUID = apiData['own_parent.pid'];
    let issueRequest = await fetchItemData(baseUrl, issueUUID, k7);
    let apiDataIssue = issueRequest[0].response.docs[0];
    let modsIssue = issueRequest[1];
    // Získání dat o nadřazeném volume
    let volumeUUID = apiDataIssue['own_parent.pid'];
    let volumeRequest = await fetchItemData(baseUrl, volumeUUID, k7);
    let apiDataVolume = volumeRequest[0].response.docs[0];
    let modsVolume = volumeRequest[1];

    // Vygenerování částí citace
    authors = await parseModsAuthors(modsData, lang);
    title = await parsePeriodicalTitle(modsData, apiData, lang);
    publication = await parsePeriodicalPublisher(modsData, apiData, lang, apiDataTitle, modsTitle, apiDataVolume, modsVolume, apiDataIssue, modsIssue);
    if (apiDataTitle['id_issn'] !== undefined) {
      issn = 'ISSN ' + apiDataTitle['id_issn'][0] + '.' || '';
    }
    availibility = dlUrl + apiData['pid'] || '';
  }

  // Sestaveni citace
  if (model === 'monograph' || model === 'convolute' || model === 'monographunit') {
    citation.bibtex = `@book{${apiData['pid']}, `;
  } else {
    citation.bibtex = `@misc{${apiData['pid']}, `;
  }

  if (authors && authors.txt?.length > 0 && model !== 'periodical') {
    console.log('Authors', authors);
    citation.txt += `${removeDoubleDot(authors.txt)} `;
    citation.html += `${removeDoubleDot(authors.txt)} `;
    citation.bibtex += `author = {${authors.bibtex}}, `;
  }
  if (title && title.length === 1) {
    citation.txt += `${title[0]} `;
    citation.html += `<i>${title[0]}</i> `;
    citation.bibtex += `title = {${removeTrailingDot(title[0])}}, `;
  }
  if (title && title.length === 2) {
    citation.txt += `${title[0]}. ${title[1]}. `;
    citation.html += `<i>${title[0]}.</i> `;
    if (title[1] && title[1].length > 0) {
      citation.html += `${title[1]}. `;
    }
    citation.bibtex += `title = {${removeTrailingDot(title[0])}}, `;
  }
  if (title && title.length === 3) {
    if (title[2] && title[2].length > 0) {
      citation.txt += `${title[2]}. `;
      citation.html += `${title[2]}. `;
      citation.bibtex += `title = {${removeTrailingDot(title[2])}}, `;
    }
    citation.txt += `${title[0]}. ${title[1]}. `;
    citation.html += `<i>${title[0]}.</i> `;
    if (title[1] && title[1].length > 0) {
      citation.html += `${title[1]}. `;
    }
    citation.bibtex += `title = {${removeTrailingDot(title[0])}}, `;
  }
  if (model === 'map' && scale) {
    citation.txt += `${scale} `;
    citation.html += `${scale} `;
  }
  if (publication) {
    citation.txt += `${publication.txt} `;
    citation.html += `${publication.txt} `;
    citation.bibtex += `${publication.bibtex} `;
  }
  if ((model === 'map' || model === 'graphic') && physicalDesc) {
    citation.txt += `${physicalDesc} `;
    citation.html += `${physicalDesc} `;
  }
  if (isbn) {
    citation.txt += `${isbn} `;
    citation.html += `${isbn} `;
    citation.bibtex += `isbn = {${removeTrailingDot(isbn)}}, `;
  }
  if (issn) {
    citation.txt += `${issn} `;
    citation.html += `${issn} `;
    citation.bibtex += `isbn = {${removeTrailingDot(issn)}}, `;
  }
  if (availibility) {
    citation.txt += locale['available'] + `${availibility}`;
    citation.html += locale['available'] + `<a href='${availibility}' target='_blank'>${availibility}</a>`;
    citation.bibtex += `url = {${availibility}}`;
  }

  citation.bibtex += `}`;
  // https://www.digitalniknihovna.cz/mzk/uuid/uuid:869e4730-6c8b-11e2-8ed6-005056827e52

  return [citation, apiData, modsData];
}

function removeTrailingDot(input: string): string {
  // Check if the string ends with a dot
  if (input.endsWith('.')) {
    return input.slice(0, -1); // Remove the last character
  }
  return input; // Return the original string if no trailing dot
}
function removeDoubleDot(input: string): string {
  // Check if the string ends with a dot
  if (input.endsWith('..')) {
    return input.slice(0, -1); // Remove the last character
  }
  return input; // Return the original string if no trailing dot
}





