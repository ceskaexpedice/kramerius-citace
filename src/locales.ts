import fs from 'fs';
import path from 'path';

const locales: Record<string, any> = {};

function loadLocales() {
  const localeFiles = ['cs.json', 'en.json'];  // přidáš další jazyky
  localeFiles.forEach((file) => {
    const langCode = file.split('.')[0];
    const filePath = path.join(__dirname, '../locales', file);
    const content = fs.readFileSync(filePath, 'utf8');
    locales[langCode] = JSON.parse(content);
  });
}

export function getLocale(lang: string): any {
  return locales[lang] || locales['cs'];  // Pokud není dostupný jazyk, vrací se výchozí jazyk (čeština)
}

// Načti jazykové soubory při spuštění aplikace
loadLocales();
