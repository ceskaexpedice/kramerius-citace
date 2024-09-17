import fs from 'fs';
import path from 'path';
import { parseModsAuthors, parseModsTitles, parseModsPublisher } from '../services/modsParser';
import { Request, Response } from 'express';
import { parseStringPromise } from 'xml2js';

export async function testEndpoint(req: Request, res: Response) {
  try {
    const output = await runModsTests(); // Spustíme všechny testy a získáme výstup jako text
    
    // Odpovíme výsledky jako prostý text
    res.status(200).send(`<pre>${output}</pre>`);
  } catch (error) {
    res.status(500).json({ error: 'Chyba při spouštění testů' });
  }
}

// Funkce pro načtení všech testovacích MODS souborů a vrácení výsledků jako text
export async function runModsTests(): Promise<string> {
    const testDir = path.join(__dirname, './testMods');
    
    let results = ''; // Shromáždíme všechny výsledky do jednoho řetězce

    // Načtení všech souborů ve složce
    const testFiles = fs.readdirSync(testDir);
    
    for (const file of testFiles) {
      const filePath = path.join(testDir, file);
      const modsData = await parseStringPromise(fs.readFileSync(filePath, 'utf8'), { explicitArray: true });
      // console.log('modsData', modsData);
      
      // Zavolání vaší funkce pro zpracování MODS dat
      const authors = await parseModsAuthors(modsData, 'cs');
      const title = await parseModsTitles(modsData, 'cs');
      const publication = await parseModsPublisher(modsData, 'cs');

      // Zpracování <desc> elementu
      const descElement = modsData["mods:modsCollection"]["desc"];
      let descOutput = '';
      if (descElement) {
        const uuid = descElement[0]?.uuid?.[0] || 'UUID neznámé';
        const note = descElement[0]?.note?.[0] || 'Poznámka neznámá';
        descOutput = `UUID: ${uuid}\nNote: ${note}`;
      }
      
      // Uložíme výsledky do proměnné
      results += `\nTest file: ${file}\n`;
      if (descOutput) {
        results += `${descOutput}\n`;
      }
      results += `Authors: ${authors}\n`;
      results += `Title: ${title}\n`;
      results += `Publication: ${publication}\n`;
      results += '-----------------------------\n';
    }

    // Vrátíme všechny výsledky jako textový řetězec
    return results;
}
