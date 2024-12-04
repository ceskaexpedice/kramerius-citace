import { Request, Response } from 'express';
import axios from 'axios';
import { getLocale } from '../locales';
import { parseStringPromise } from 'xml2js';
import { parseModsAuthors, parseModsTitles, parseModsPublisher, parseModsCartographics, parsePhysicalDescription, parsePeriodicalTitle, parsePeriodicalPublisher } from './modsParser';


// Funkce pro stažení dat přes API
async function fetchItemData(url: string, uuid: string) {
  const api_url = `${url}/search/api/client/v7.0/search?q=pid:%22${uuid}%22&rows=1`;
  const mods_url = `${url}/search/api/client/v7.0/items/${uuid}/metadata/mods`;
  
  console.log('Fetching data', api_url, mods_url);

  try {
    const api_response = await axios.get(api_url);
    const mods_response = await axios.get(mods_url);
    const parsedMods = await parseStringPromise(mods_response.data, { explicitArray: true });
    return [api_response.data, parsedMods];
  } catch (error) {
    throw new Error('Data not found or error in fetching data');
  }
}

// Hlavní funkce pro získání metadat a vraceni citace
export async function getCitation(req: Request, res: Response) {
  const { uuid, url, lang = 'cs', exp = 'iso690', format = 'txt', ref = '', debug = 'false' } = req.query;
  // console.log('Request params', req.query);

  if (!uuid) {
    return res.status(422).json({ error: 'Missing uuid parameter in format "uuid={uuid}"' });
  }
  if (!url) {
    return res.status(422).json({ error: 'Missing url parameter in format "url={url}"' });
  }

  try {
    const data = await fetchItemData(url as string, uuid as string);
    const responce = await generateCitation(data, url as string, lang as string, ref as string);
    const citation = responce[0];
    const apiSource = responce[1];
    const modsSource = responce[2];
    if (exp === 'all') {
      if (debug === 'true') {
        return res.status(200).json({ citation, apiSource, modsSource });
      } else {
        return res.status(200).json(citation);
      }
    } else {
      let formattedCitation;
      if (exp === '' && format !== 'html') {
        formattedCitation = citation['iso690'];
      } else if ((exp === '' || exp === 'iso690') && format === 'html') {
        formattedCitation = citation['iso690html'];
      } else if (exp === 'mla' && format === 'html') {
        formattedCitation = citation['mlahtml'];
      } else {
        formattedCitation = citation[String(exp)];
      }
      if (!formattedCitation) {
        return res.status(400).json({ error: 'Unsupported export requested.' });
      }
    
      switch (String(format).toLowerCase()) {
        case 'txt':
        case '':
          res.set('Content-Type', 'text/plain');
          break;
        case 'html':
          res.set('Content-Type', 'text/html');
          break;
        default:
          return res.status(400).json({ error: 'Invalid format specified.' });
      }
      if (debug === 'true') {
        return res.status(200).json({ formattedCitation, apiSource, modsSource });
      } else {
        return res.status(200).send(formattedCitation);
      }
    }
  } catch (error) {
    console.log('Error', error);
    return res.status(500).json({ error: (error as any).message });
  }
}

// Generování citace
async function generateCitation(data: any, url: string, lang: string, ref: string): Promise<any> {
  const locale = getLocale(lang);

  let citation: { iso690?: string, iso690html?: string, mla?: string, mlahtml?: string, bibtex?: string, wiki?: string, ris?: string } = { iso690: '', iso690html: '', mla: '', mlahtml: '', bibtex: '', wiki: '', ris: '' };
  const apiData = data[0].response?.docs?.[0];
  const modsData = data[1];
  const model = apiData['model'];

  let authors;
  let authorsTitle;
  let title;
  let titleMono;
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
      model === 'soundrecording' ||
     (model === 'page' && (apiData['own_parent.model'] === 'monograph' || apiData['own_parent.model'] === 'convolute' || apiData['own_parent.model'] === 'monographunit' || apiData['own_parent.model'] === 'map' || apiData['own_parent.model'] === 'graphic' || apiData['own_parent.model'] === 'sheetmusic' || apiData['own_parent.model'] === 'archive' || apiData['own_parent.model'] === 'manuscript'))) {
    
    let monographicData;

    if (model === 'page') {
      let pageNumber = apiData['page.number'] || '';
      data = await fetchItemData(url, apiData['own_parent.pid']);
      monographicData = await getMonographicData(data, lang, ref, pageNumber);
    } else {
      monographicData = await getMonographicData(data, url, lang, ref);
    }
    if (!monographicData) {
      throw new Error('Data not found');
    }
    authors = monographicData.authors;
    titleMono = monographicData.title;
    console.log('titleMono', titleMono);
    publication = monographicData.publication;
    scale = monographicData.scale;
    physicalDesc = monographicData.physicalDesc;
    isbn = monographicData.isbn;
    issn = monographicData.issn;
    availibility = monographicData.availibility;
  }

  // INTERNI CASTI MONOGRAFIE
  if (model === 'internalpart') {
    let internalPartData = await getInternalPartData(data, url, lang, ref);
    
    if (!internalPartData) {
      throw new Error('Data not found');
    }
    authors = internalPartData.authorsChapter;
    authorsTitle = internalPartData.authorsTitle;
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
      data = await fetchItemData(url, apiData['own_parent.pid']);
      volumeData = await getPeriodicalVolumeData(data, url, lang, ref, pageNumber);
    } else {
      volumeData = await getPeriodicalVolumeData(data, url, lang, ref);
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
      data = await fetchItemData(url, apiData['own_parent.pid']);
      issueData = await getPeriodicalIssueData(data, url, lang, ref, pageNumber);
    } else {
      issueData = await getPeriodicalIssueData(data, url, lang, ref);
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
    let articleData = await getPeriodicalArticleData(data, url, lang, ref);
    authors = articleData.authors;
    title = articleData.title;
    publication = articleData.publication;
    issn = articleData.issn;
    availibility = articleData.availibility;
  }

  // COLLECTION
  if (model === 'collection') {
    title = [apiData['title.search']];
    availibility = ref;
  }

  // ZVUKOVE NAHRAVKY
  // soundunit
  if (model === 'soundunit' || model === 'track') {
    let soundunitData = await getPeriodicalVolumeData(data, url, lang, ref);
    authors = soundunitData.authorsTitle;
    title = soundunitData.title;
    publication = soundunitData.publication;
    issn = soundunitData.issn;
    availibility = soundunitData.availibility;

    console.log('soundunitData', soundunitData.title);
  }

  // =========   SESTAVENI CITACE ==========
  if (model === 'monograph' || model === 'convolute' || model === 'monographunit' || (model === 'page' && (apiData['own_parent.model'] === 'monograph' || apiData['own_parent.model'] === 'convolute' || apiData['own_parent.model'] === 'monographunit'))) {
    citation.bibtex = `@book{${apiData['pid']}, `;
    citation.wiki = `{{ ${locale['wiki']['monograph']} | `;
    citation.ris = `TY  - BOOK\n`;
  } else if (model === 'map' || (model === 'page' && apiData['own_parent.model'] === 'map')) {
    citation.bibtex = `@misc{${apiData['pid']}, `;
    citation.wiki = `{{ ${locale['wiki']['monograph']} | `;
    citation.ris = `TY  - MAP\n`;
  } else if (model === 'periodical' || (model === 'page' && apiData['own_parent.model'] === 'periodical')) {
    citation.bibtex = `@periodical{${apiData['pid']}, `;
    citation.wiki = `{{ ${locale['wiki']['periodical']} | `;
    citation.ris = `TY  - JFULL\n`;
  } else if (model === 'periodicalvolume' || model === 'periodicalitem' || model === 'supplement' || (model === 'page' && (apiData['own_parent.model'] === 'periodicalvolume' || apiData['own_parent.model'] === 'periodicalitem' || apiData['own_parent.model'] === 'supplement'))) {
    citation.bibtex = `@periodical{${apiData['pid']}, `;
    citation.wiki = `{{ ${locale['wiki']['periodical']} | `;
    citation.ris = `TY  - JOUR\n`;
  } else if (model === 'article' || (model === 'page' && apiData['own_parent.model'] === 'article')) {
    citation.bibtex = `@article{${apiData['pid']}, `;
    citation.wiki = `{{ ${locale['wiki']['periodical']} | `;
    citation.ris = `TY  - JOUR\n`;
  } else if (model === 'internalpart' || (model === 'page' && apiData['own_parent.model'] === 'internalpart')) {
    citation.bibtex = `@inbook{${apiData['pid']}, `;
    citation.wiki = `{{ ${locale['wiki']['monograph']} | `;
    citation.ris = `TY  - CHAP\n`;
  } else if (model === 'manuscript' || (model === 'page' && apiData['own_parent.model'] === 'manuscript')) {
    citation.bibtex = `@misc{${apiData['pid']}, `;
    citation.wiki = `{{ ${locale['wiki']['monograph']} | `;
    citation.ris = `TY  - MANSCPT\n`;
  } else {
    citation.bibtex = `@misc{${apiData['pid']}, `;
    citation.wiki = `{{ ${locale['wiki']['monograph']} | `;
    citation.ris = `TY  - GEN\n`;
  }

  // AUTHORS
  if (authors && authors.iso?.length > 0 && model !== 'periodical') {
    citation.iso690 += `${removeDoubleDot(authors.iso)} `;
    citation.iso690html += `${removeDoubleDot(authors.iso)} `;
    citation.mla += `${removeDoubleDot(authors.mla)} `;
    citation.mlahtml += `${removeDoubleDot(authors.mla)} `;
    citation.bibtex += `author = {${authors.bibtex}}, `;
    citation.wiki += `${authors.wiki}`;
    citation.ris += `${authors.ris}`;
  }

  // MONOGRAPH TITLE
  if (titleMono) {
    citation.iso690 += `${removeTrailingDot(titleMono.txt)}. `;
    citation.iso690html += `<i>${removeTrailingDot(titleMono.txt)}.</i> `;
    citation.mla += `${removeTrailingDot(titleMono.txt)}. `;
    citation.mlahtml += `<i>${removeTrailingDot(titleMono.txt)}.</i> `;
    citation.bibtex += `title = {${removeTrailingDot(titleMono.txt)}}, `;
    citation.wiki += `${removeTrailingDot(titleMono.wiki)}`;
    citation.ris += `${removeTrailingDot(titleMono.ris)}`;
  }

  // PERIODICAL TITLE
  if (title && title.length === 1) {
    citation.iso690 += `${removeTrailingDot(title[0])}. `;
    citation.iso690html += `<i>${removeTrailingDot(title[0])}.</i> `;
    citation.mla += `${removeTrailingDot(title[0])}`;
    citation.mlahtml += `<i>${removeTrailingDot(title[0])}</i>`;
    citation.bibtex += `title = {${removeTrailingDot(title[0])}}, `;
    citation.wiki += `${locale['wiki']['title']} = ${removeTrailingDot(title[0])} |`;
    citation.ris += `T1  - ${removeTrailingDot(title[0])}\n`;
  }
  // periodical issue
  if (title && title.length === 2) {
    citation.iso690 += `${title[0]}. ${title[1]}. `;
    citation.iso690html += `<i>${title[0]}.</i> `;
    if (title[1] && title[1].length > 0) {
      citation.iso690html += `${title[1]}. `;
    }
    citation.mla += `${title[0]}, ${title[1]}`;
    citation.mlahtml += `<i>${title[0]}</i>`;
    if (title[1] && title[1].length > 0) {
      citation.mlahtml += `, ${title[1]}`;
    }
    citation.bibtex += `title = {${removeTrailingDot(title[0])}}, `;
    citation.wiki += `${locale['wiki']['title']} = ${removeTrailingDot(title[0])} |`;
    citation.ris += `T1  - ${removeTrailingDot(title[0])}\n`;
    
  }
  // article
  if (title && title.length === 3) {
    // nazev clanku
    if (title[2] && title[2].length > 0) {
      citation.iso690 += `${title[2]}. `;
      citation.iso690html += `${title[2]}. `;
      citation.mla += `${title[2]}. `;
      citation.mlahtml += `${title[2]}. `;
      citation.bibtex += `title = {${removeTrailingDot(title[2])}}, `;
      citation.wiki += `${locale['wiki']['title']} = ${removeTrailingDot(title[2])} |`;
      citation.ris += `T1  - ${removeTrailingDot(title[2])}\n`;
    }
    // nazev periodika
    if (title[0] && title[0].length > 0) {
      citation.iso690 += `${title[0]}. `;
      citation.iso690html += `<i>${title[0]}</i>. `;
      citation.mla += `${title[0]}, `;
      citation.mlahtml += `<i>${title[0]}</i>, `;
      citation.bibtex += `journal = {${removeTrailingDot(title[0])}}, `;
      citation.wiki += `${locale['wiki']['journal']} = ${removeTrailingDot(title[0])} |`;
      citation.ris += `JF  - ${removeTrailingDot(title[0])}\n`;
    }
    // datum vydani
    if (title[1] && title[1].length > 0) {
      citation.iso690 += `${title[1]}. `;
      citation.iso690html += `${title[1]}. `;
      citation.mla += `${title[1]}`;
      citation.mlahtml += `${title[1]}`;
    }
  }
  // internalpart
  if (title && title.length === 4) {
    // nazev kapitoly
    if (title[2] && title[2].length > 0) {
      citation.iso690 += `${title[2]}. `;
      citation.iso690html += `${title[2]}. `;
      citation.mla += `"${title[2]}." `;
      citation.mlahtml += `"${title[2]}." `;
      citation.bibtex += `title = {${removeTrailingDot(title[2])}}, `;
      citation.wiki += `${locale['wiki']['chapter']} = ${removeTrailingDot(title[2])} | `;
      citation.ris += `T1  - ${removeTrailingDot(title[2])}\n`;
    }
    // In
    if (title[3] && title[3].length > 0) {
      citation.iso690 += `${title[3]} `;
      citation.iso690html += `${title[3]} `;
    }
    // autor monografie
    if (authorsTitle && authorsTitle.iso?.length > 0) {
      citation.iso690 += `${removeDoubleDot(authorsTitle.iso)} `;
      citation.iso690html += `${removeDoubleDot(authorsTitle.iso)} `;
      citation.mla += `${removeDoubleDot(authorsTitle.mla)} `;
      citation.mlahtml += `${removeDoubleDot(authorsTitle.mla)} `;
      citation.bibtex += `author = {${authorsTitle.bibtex}}, `;
      citation.wiki += `${authorsTitle.wiki}`;
      citation.ris += `${authorsTitle.ris}`;
    }
    // nazev monografie
    if (title[0] && title[0].length > 0) {
      citation.iso690 += `${title[0]}. `;
      citation.iso690html += `<i>${title[0]}.</i> `;
      citation.mla += `${title[0]} `;
      citation.mlahtml += `<i>${title[0]}</i> `;
      citation.bibtex += `booktitle = {${removeTrailingDot(title[0])}}, `;
      citation.wiki += `${locale['wiki']['title']} = ${removeTrailingDot(title[0])} |`;
      citation.ris += `T2  - ${removeTrailingDot(title[0])}\n`;
    }
  }

  // MERITKO
  if (model === 'map' && scale) {
    citation.iso690 += `${scale} `;
    citation.iso690html += `${scale} `;
  }

  // PUBLICATION
  if (publication) {
    citation.iso690 += `${publication.iso} `;
    citation.iso690html += `${publication.iso} `;
    citation.mla += `${publication.mla} `;
    citation.mlahtml += `${publication.mla} `;
    citation.bibtex += `${publication.bibtex} `;
    citation.wiki += `${publication.wiki}`;
    citation.ris += `${publication.ris}`;
  }

  // PHYSICAL DESCRIPTION
  if ((model === 'map' || model === 'graphic') && physicalDesc) {
    citation.iso690 += `${physicalDesc} `;
    citation.iso690html += `${physicalDesc} `;
  }

  // ISBN (mla neobsahuje ISBN)
  if (isbn) {
    citation.iso690 += `${isbn} `;
    citation.iso690html += `${isbn} `;
    citation.bibtex += `isbn = {${removeTrailingDot(isbn)}}, `;
    citation.wiki += `${locale['wiki']['isbn']} = ${removeTrailingDot(isbn)}|`;
    citation.ris += `SN  - ${removeTrailingDot(isbn)}\n`;
  }

  // ISSN
  if (issn) {
    citation.iso690 += `${issn} `;
    citation.iso690html += `${issn} `;
    citation.bibtex += `isbn = {${removeTrailingDot(issn)}}, `;
    citation.wiki += `${locale['wiki']['issn']} = ${removeTrailingDot(issn)}|`;
    citation.ris += `SN  - ${removeTrailingDot(issn)}\n`;
  }

  // AVAILIBILITY
  if (availibility && ref.length > 0) {
    citation.iso690 += locale['available'] + `${availibility}`;
    citation.iso690html += locale['available'] + `<a href='${availibility}' target='_blank'>${availibility}</a>`;
    citation.bibtex += `url = {${availibility}}`;
  } else {
    if (citation.iso690) {
      citation.iso690 = citation.iso690.trim();
    }
    if (citation.iso690html) {
      citation.iso690html = citation.iso690html.trim();
    }
    if (citation.mla) {
      citation.mla = citation.mla.trim();
    }
    if (citation.mlahtml) {
      citation.mlahtml = citation.mlahtml.trim();
    }
    if (citation.bibtex) {
      citation.bibtex = removeTrailingComma(citation.bibtex.trim());
    }
    if (citation.wiki) {
      citation.wiki = removeTrailingComma(citation.wiki.trim());
    }
  }

  citation.bibtex += `}`;
  citation.wiki += `}}`;
  citation.ris += `ER  - \n\n`;
  // https://www.digitalniknihovna.cz/mzk/uuid/uuid:869e4730-6c8b-11e2-8ed6-005056827e52

  return [citation, apiData, modsData];
}


// =========   FUNKCE PRO ZISKANI DAT O DOKUMENTU ==========

// Získání dat o monografickém dokumentu
async function getMonographicData(data: any, url: string, lang: string, ref: string, pageNumber?: string) {
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
  let availibility = ref;

  return { 'authors': authors, 'title': title, 'publication': publication, 'scale': scale, 'physicalDesc': physicalDesc, 'issn': issn, 'isbn': isbn, 'availibility': availibility };
}

// Získání dat o interní části monografického dokumentu
async function getPeriodicalVolumeData(data: any, url: string, lang: string, ref: string, pageNumber?: string) {
  const apiData = data[0].response.docs[0];
  const modsData = data[1];

  // Získání dat o nadřazeném titulu
  let titleRequest = await fetchItemData(url, apiData['root.pid']);
  let apiDataTitle = titleRequest[0].response.docs[0];
  let modsTitle = titleRequest[1];

  // Vygenerování částí citace   
  let authors = await parseModsAuthors(modsData, lang);
  let authorsTitle = await parseModsAuthors(modsTitle, lang);
  let title = await parsePeriodicalTitle(modsData, apiData, lang);
  let publication = await parsePeriodicalPublisher(modsData, apiData, lang, apiDataTitle, modsTitle, null, null, null, null, pageNumber);
  let issn = '';
  if (apiDataTitle['id_issn'] !== undefined) {
    issn = 'ISSN ' + apiDataTitle['id_issn'][0] + '.' || '';
  }
  let availibility = ref;

  return { 'authors': authors, 'authorsTitle': authorsTitle, 'title': title, 'publication': publication, 'issn': issn, 'availibility': availibility };
}

async function getPeriodicalIssueData(data: any, url: string, lang: string, ref: string, pageNumber?: string) {
  const apiData = data[0].response.docs[0];
  const modsData = data[1];
  
  // Získání dat o nadřazeném titulu
  let titleRequest = await fetchItemData(url, apiData['root.pid']);
  let apiDataTitle = titleRequest[0].response.docs[0];
  let modsTitle = titleRequest[1];
  // Získání dat o nadřazeném volume
  let volumeUUID = apiData['own_parent.pid'];
  let volumeRequest = await fetchItemData(url, volumeUUID);
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
  let availibility = ref;

  return { 'authors': authors, 'title': title, 'publication': publication, 'issn': issn, 'availibility': availibility };
}

async function getPeriodicalArticleData(data: any, url: string, lang: string, ref: string) {
  const apiData = data[0].response.docs[0];
  const modsData = data[1];

  // Získání dat o nadřazeném titulu
  let titleRequest = await fetchItemData(url, apiData['root.pid']);
  let apiDataTitle = titleRequest[0].response.docs[0];
  let modsTitle = titleRequest[1];
  // Získání dat o nadřazeném issue
  let issueUUID = apiData['own_parent.pid'];
  let issueRequest = await fetchItemData(url, issueUUID);
  let apiDataIssue = issueRequest[0].response.docs[0];
  let modsIssue = issueRequest[1];
  // Získání dat o nadřazeném volume
  let volumeUUID = apiDataIssue['own_parent.pid'];
  let volumeRequest = await fetchItemData(url, volumeUUID);
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
  let availibility = ref;

  return { 'authors': authors, 'title': title, 'publication': publication, 'issn': issn, 'availibility': availibility };
}

async function getInternalPartData(data: any, url: string, lang: string, ref: string, pageNumber?: string) {
  const apiData = data[0].response.docs[0];
  const modsData = data[1];

  // Získání dat o nadřazeném titulu
  let titleRequest = await fetchItemData(url, apiData['root.pid']);
  let apiDataTitle = titleRequest[0].response.docs[0];
  let modsTitle = titleRequest[1];

  // Vygenerování částí citace
  let authorsChapter = await parseModsAuthors(modsData, lang);
  let authorsTitle = await parseModsAuthors(modsTitle, lang);
  let title = await parsePeriodicalTitle(modsData, apiData, lang);
  let publication = await parsePeriodicalPublisher(modsData, apiData, lang, apiDataTitle, modsTitle, null, null, null, pageNumber);
  let isbn = '';
  if (apiDataTitle['id_isbn'] !== undefined) {
    isbn = 'ISBN ' + apiDataTitle['id_isbn'][0] + '.' || '';
  }
  let availibility = ref;
  
  return { 'authorsChapter': authorsChapter, 'authorsTitle': authorsTitle, 'title': title, 'publication': publication, 'isbn': isbn, 'availibility': availibility };
}

// Pomocné funkce

function removeTrailingDot(input: string): string {
  // Check if the string ends with a dot
  if (input.endsWith('.') && !input.endsWith('...')) {
    return input.slice(0, -1); // Remove the last character
  }
  return input; // Return the original string if no trailing dot
}
function removeDoubleDot(input: string): string {
  // Check if the string ends with a dot
  if (input && input.endsWith('..')) {
    return input.slice(0, -1); // Remove the last character
  }
  return input; // Return the original string if no trailing dot
}
function removeTrailingComma(input: string): string {
  // Check if the string ends with a comma
  if (input.endsWith(',') || input.endsWith('|')) {
    return input.slice(0, -1); // Remove the last character
  }
  return input; // Return the original string if no trailing comma
}





