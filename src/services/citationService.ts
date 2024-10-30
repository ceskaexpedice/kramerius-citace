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
  const { uuid, url, lang = 'cs', k7 = 'true', format = '', ref = 'false', debug = 'false' } = req.query;
  // console.log('Request params', req.query);

  if (!uuid) {
    return res.status(422).json({ error: 'Missing uuid parameter in format "uuid={uuid}"' });
  }

  const baseUrl = url || KRAMERIUS_API_URLS.default;
  const dlUrl = DL_URLS.default;

  try {
    const data = await fetchItemData(baseUrl as string, uuid as string, k7 === 'true');
    const responce = await generateCitation(data, lang as string, dlUrl, ref as string);
    const citation = responce[0];
    const apiSource = responce[1];
    const modsSource = responce[2];
    if (!format) {
      if (debug === 'true') {
        return res.status(200).json({ citation, apiSource, modsSource });
      } else {
        return res.status(200).json(citation);
      }
    } else {
      if (debug === 'true') {
        return res.status(200).json({ citation, apiSource, modsSource });
      } else {
        const formattedCitation = citation[String(format)];
    
        if (!formattedCitation) {
          return res.status(400).json({ error: 'Unsupported format requested.' });
        }
    
        switch (String(format).toLowerCase()) {
          case 'txt':
          case 'bibtex':
            res.set('Content-Type', 'text/plain');
            break;
          case 'html':
            res.set('Content-Type', 'text/html');
            break;
          default:
            return res.status(400).json({ error: 'Invalid format specified.' });
        }
    
        return res.status(200).send(formattedCitation);
      }
    }
    
    // return res.status(200).json({ citation, source });
  } catch (error) {
    console.log('Error', error);
    return res.status(500).json({ error: (error as any).message });
  }
}

// Generování citace
async function generateCitation(data: any, lang: string, dlUrl: string, ref: string): Promise<any> {
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

  // MONOGRAFICKE DOKUMENTY + TITUL PERIODIKA
  if (model === 'monograph' || 
      model === 'convolute' || 
      model === 'monographunit' || 
      model === 'map'|| 
      model === 'graphic' ||
      model === 'sheetmusic' ||
      model === 'archive' ||
      model === 'manuscript' ||
      model === 'periodical' ||
     (model === 'page' && (apiData['own_parent.model'] === 'monograph' || apiData['own_parent.model'] === 'convolute' || apiData['own_parent.model'] === 'monographunit' || apiData['own_parent.model'] === 'map' || apiData['own_parent.model'] === 'graphic' || apiData['own_parent.model'] === 'sheetmusic' || apiData['own_parent.model'] === 'archive' || apiData['own_parent.model'] === 'manuscript'))) {
    
    let monographicData;

    if (model === 'page') {
      let pageNumber = apiData['page.number'] || '';
      data = await fetchItemData(KRAMERIUS_API_URLS.default, apiData['own_parent.pid'], true);
      monographicData = await getMonographicData(data, lang, dlUrl, pageNumber);
    } else {
      monographicData = await getMonographicData(data, lang, dlUrl);
    }
    if (!monographicData) {
      throw new Error('Data not found');
    }
    authors = monographicData.authors;
    title = monographicData.title;
    publication = monographicData.publication;
    scale = monographicData.scale;
    physicalDesc = monographicData.physicalDesc;
    isbn = monographicData.isbn;
    issn = monographicData.issn;
    availibility = monographicData.availibility;
  }

  // INTERNI CASTI MONOGRAFIE
  if (model === 'internalpart') {
    let internalPartData = await getInternalPartData(data, lang, dlUrl);
    
    if (!internalPartData) {
      throw new Error('Data not found');
    }

    title = internalPartData.title;
    publication = internalPartData.publication;
    isbn = internalPartData.isbn;
    availibility = internalPartData.availibility;
  }

  // CASTI PERIODIKA
  // Periodical VOLUME
  if (model === 'periodicalvolume' ||
      (model === 'page' && apiData['own_parent.model'] === 'periodicalvolume')) {

    let volumeData;
    
    if (model === 'page') {
      let pageNumber = apiData['page.number'] || '';
      data = await fetchItemData(KRAMERIUS_API_URLS.default, apiData['own_parent.pid'], true);
      volumeData = await getPeriodicalVolumeData(data, lang, dlUrl, pageNumber);
    } else {
      volumeData = await getPeriodicalVolumeData(data, lang, dlUrl);
    }
    if (!volumeData) {
      throw new Error('Data not found');
    }
    title = volumeData.title;
    publication = volumeData.publication;
    issn = volumeData.issn;
    availibility = volumeData.availibility;
  }

  // Periodical ISSUE
  if (model === 'periodicalitem' ||
      model === 'supplement' ||
     (model === 'page' && (apiData['own_parent.model'] === 'periodicalitem' || apiData['own_parent.model'] === 'supplement'))) {

    let issueData;
    
    if (model === 'page'){
      let pageNumber = apiData['page.number'] || '';
      data = await fetchItemData(KRAMERIUS_API_URLS.default, apiData['own_parent.pid'], true);
      issueData = await getPeriodicalIssueData(data, lang, dlUrl, pageNumber);
    } else {
      issueData = await getPeriodicalIssueData(data, lang, dlUrl);
    }
    if (!issueData) {
      throw new Error('Data not found');
    }
    title = issueData.title;
    publication = issueData.publication;
    issn = issueData.issn;
    availibility = issueData.availibility;
  }

  // Periodical ARTICLE
  if (model === 'article') {
    let articleData = await getPeriodicalArticleData(data, lang, dlUrl);
    authors = articleData.authors;
    title = articleData.title;
    publication = articleData.publication;
    issn = articleData.issn;
    availibility = articleData.availibility;
  }

  // COLLECTION
  if (model === 'collection') {
    title = [apiData['title.search']];
    availibility = dlUrl + apiData['pid'] || '';
  }

  // Sestaveni citace
  if (model === 'monograph' || model === 'convolute' || model === 'monographunit') {
    citation.bibtex = `@book{${apiData['pid']}, `;
  } else if (model === 'article') {
    citation.bibtex = `@article{${apiData['pid']}, `;
  } else if (model === 'internalpart') {
    citation.bibtex = `@inbook{${apiData['pid']}, `;
  } else {
    citation.bibtex = `@misc{${apiData['pid']}, `;
  }

  if (authors && authors.txt?.length > 0 && model !== 'periodical') {
    citation.txt += `${removeDoubleDot(authors.txt)} `;
    citation.html += `${removeDoubleDot(authors.txt)} `;
    citation.bibtex += `author = {${authors.bibtex}}, `;
  }
  if (title && title.length === 1) {
    citation.txt += `${removeTrailingDot(title[0])}. `;
    citation.html += `<i>${removeTrailingDot(title[0])}.</i> `;
    citation.bibtex += `title = {${removeTrailingDot(title[0])}}, `;
  }
  //periodical issue
  if (title && title.length === 2) {
    citation.txt += `${title[0]}. ${title[1]}. `;
    citation.html += `<i>${title[0]}.</i> `;
    if (title[1] && title[1].length > 0) {
      citation.html += `${title[1]}. `;
    }
    citation.bibtex += `title = {${removeTrailingDot(title[0])}}, `;
  }
  // article
  if (title && title.length === 3) {
    if (title[2] && title[2].length > 0) {
      citation.txt += `${title[2]}. `;
      citation.html += `${title[2]}. `;
      citation.bibtex += `title = {${removeTrailingDot(title[2])}}, `;
    }
    citation.txt += `${title[0]}. ${title[1]}. `;
    citation.html += `<i>${title[0]}.</i> `;
    if (title[1] && title[1].length > 0) {
      citation.txt += `${title[1]}. `;
      citation.html += `${title[1]}. `;
    }
    citation.bibtex += `title = {${removeTrailingDot(title[0])}}, `;
  }
  // internalpart
  if (title && title.length === 4) {
    if (title[2] && title[2].length > 0) {
      citation.txt += `${title[2]}. `;
      citation.html += `${title[2]}. `;
      citation.bibtex += `title = {${removeTrailingDot(title[2])}}, `;
    }
    if (title[3] && title[3].length > 0) {
      citation.txt += `${title[3]} `;
      citation.html += `${title[3]} `;
    }
    if (title[0] && title[0].length > 0) {
      citation.txt += `${title[0]}. `;
      citation.html += `<i>${title[0]}.</i> `;
      citation.bibtex += `booktitle = {${removeTrailingDot(title[0])}}, `;
    }
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
  if (availibility && ref === 'true') {
    citation.txt += locale['available'] + `${availibility}`;
    citation.html += locale['available'] + `<a href='${availibility}' target='_blank'>${availibility}</a>`;
    citation.bibtex += `url = {${availibility}}`;
  } else {
    if (citation.txt) {
      citation.txt = citation.txt.trim();
    }
    if (citation.html) {
      citation.html = citation.html.trim();
    }
    if (citation.bibtex) {
      citation.bibtex = removeTrailingComma(citation.bibtex.trim());
    }
  }

  citation.bibtex += `}`;
  // https://www.digitalniknihovna.cz/mzk/uuid/uuid:869e4730-6c8b-11e2-8ed6-005056827e52

  return [citation, apiData, modsData];
}

// Získání dat o monografickém dokumentu
async function getMonographicData(data: any, lang: string, dlUrl: string, pageNumber?: string) {
  const apiData = data[0].response.docs[0];
  const modsData = data[1];
  let authors = await parseModsAuthors(modsData, lang);
  let title = await parseModsTitles(modsData, lang);
  let publication = await parseModsPublisher(modsData, lang, pageNumber);
  let scale = await parseModsCartographics(modsData, lang);
  let physicalDesc = await parsePhysicalDescription(modsData, lang);
  let isbn = '';
  if (apiData['id_isbn'] !== undefined) {
    isbn = 'ISBN ' + apiData['id_isbn'][0] + '.' || '';
  }
  let issn = '';
  if (apiData['id_issn'] !== undefined) {
    issn = 'ISSN ' + apiData['id_issn'][0] + '.' || '';
  }
  let availibility = dlUrl + apiData['pid'] || '';

  return { 'authors': authors, 'title': title, 'publication': publication, 'scale': scale, 'physicalDesc': physicalDesc, 'issn': issn, 'isbn': isbn, 'availibility': availibility };
}

async function getPeriodicalVolumeData(data: any, lang: string, dlUrl: string, pageNumber?: string) {
  const apiData = data[0].response.docs[0];
  const modsData = data[1];

  const baseUrl = KRAMERIUS_API_URLS.default;
  const k7 = true;
  
  // Získání dat o nadřazeném titulu
  let titleRequest = await fetchItemData(baseUrl, apiData['root.pid'], k7);
  let apiDataTitle = titleRequest[0].response.docs[0];
  let modsTitle = titleRequest[1];

  // Vygenerování částí citace   
  let authors = await parseModsAuthors(modsData, lang); 
  let title = await parsePeriodicalTitle(modsData, apiData, lang);
  let publication = await parsePeriodicalPublisher(modsData, apiData, lang, apiDataTitle, modsTitle, null, null, null, null, pageNumber);
  let issn = '';
  if (apiDataTitle['id_issn'] !== undefined) {
    issn = 'ISSN ' + apiDataTitle['id_issn'][0] + '.' || '';
  }
  let availibility = dlUrl + apiData['pid'] || '';

  return { 'authors': authors, 'title': title, 'publication': publication, 'issn': issn, 'availibility': availibility };
}

async function getPeriodicalIssueData(data: any, lang: string, dlUrl: string, pageNumber?: string) {
  const apiData = data[0].response.docs[0];
  const modsData = data[1];

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
  let authors = await parseModsAuthors(modsData, lang);
  let title = await parsePeriodicalTitle(modsData, apiData, lang);
  let publication = await parsePeriodicalPublisher(modsData, apiData, lang, apiDataTitle, modsTitle, apiDataVolume, modsVolume, null, null, pageNumber);
  let issn = '';
  if (apiDataTitle['id_issn'] !== undefined) {
    issn = 'ISSN ' + apiDataTitle['id_issn'][0] + '.' || '';
  }
  let availibility = dlUrl + apiData['pid'] || '';

  return { 'authors': authors, 'title': title, 'publication': publication, 'issn': issn, 'availibility': availibility };
}

async function getPeriodicalArticleData(data: any, lang: string, dlUrl: string) {
  const apiData = data[0].response.docs[0];
  const modsData = data[1];

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
  let authors = await parseModsAuthors(modsData, lang);
  let title = await parsePeriodicalTitle(modsData, apiData, lang);
  let publication = await parsePeriodicalPublisher(modsData, apiData, lang, apiDataTitle, modsTitle, apiDataVolume, modsVolume, apiDataIssue, modsIssue);
  let issn = '';
  if (apiDataTitle['id_issn'] !== undefined) {
    issn = 'ISSN ' + apiDataTitle['id_issn'][0] + '.' || '';
  }
  let availibility = dlUrl + apiData['pid'] || '';

  return { 'authors': authors, 'title': title, 'publication': publication, 'issn': issn, 'availibility': availibility };
}

async function getInternalPartData(data: any, lang: string, dlUrl: string, pageNumber?: string) {
  const apiData = data[0].response.docs[0];
  const modsData = data[1];

  const baseUrl = KRAMERIUS_API_URLS.default;
  const k7 = true;

  // Získání dat o nadřazeném titulu
  let titleRequest = await fetchItemData(baseUrl, apiData['root.pid'], k7);
  let apiDataTitle = titleRequest[0].response.docs[0];
  let modsTitle = titleRequest[1];

  // Vygenerování částí citace
  let authors = await parseModsAuthors(modsData, lang);
  let title = await parsePeriodicalTitle(modsData, apiData, lang);
  let publication = await parsePeriodicalPublisher(modsData, apiData, lang, apiDataTitle, modsTitle, null, null, null, pageNumber);
  let isbn = '';
  if (apiDataTitle['id_isbn'] !== undefined) {
    isbn = 'ISBN ' + apiDataTitle['id_isbn'][0] + '.' || '';
  }
  let availibility = dlUrl + apiData['pid'] || '';
  
  return { 'authors': authors, 'title': title, 'publication': publication, 'isbn': isbn, 'availibility': availibility };
}

// Pomocné funkce

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
function removeTrailingComma(input: string): string {
  // Check if the string ends with a comma
  if (input.endsWith(',')) {
    return input.slice(0, -1); // Remove the last character
  }
  return input; // Return the original string if no trailing comma
}





