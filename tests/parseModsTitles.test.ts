// tests/parseModsTitles.test.ts
import { parseModsTitles } from '../src/services/modsParser';
import { getLocale } from '../src/locales';

jest.mock('../src/locales', () => ({
  getLocale: jest.fn(),
}));

describe('parseModsTitles', () => {
  beforeEach(() => {
    // Nastavení mockované lokality
    (getLocale as jest.Mock).mockReturnValue({ part: 'část' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('vrátí prázdný řetězec, pokud nejsou titulní informace', async () => {
    const mods = {
      "mods:modsCollection": {
        "mods:mods": [{}]
      }
    };
    const result = await parseModsTitles(mods, 'cs');
    expect(result).toBe('');
  });

  it('správně zpracuje jeden hlavní titul bez podnázvu', async () => {
    const mods = {
      "mods:modsCollection": {
        "mods:mods": [
          {
            "mods:titleInfo": [
              {
                "mods:title": "Název Knihy"
              }
            ]
          }
        ]
      }
    };
    const result = await parseModsTitles(mods, 'cs');
    expect(result).toBe('Název Knihy.');
  });

  it('správně zpracuje jeden hlavní titul s podnázvem', async () => {
    const mods = {
      "mods:modsCollection": {
        "mods:mods": [
          {
            "mods:titleInfo": [
              {
                "mods:title": "Název Knihy",
                "mods:subTitle": "Podnázev Knihy"
              }
            ]
          }
        ]
      }
    };
    const result = await parseModsTitles(mods, 'cs');
    expect(result).toBe('Název Knihy: Podnázev Knihy.');
  });

  it('správně zpracuje více titulů, včetně alternativních', async () => {
    const mods = {
      "mods:modsCollection": {
        "mods:mods": [
          {
            "mods:titleInfo": [
              {
                "mods:title": "Hlavní Název",
                "mods:subTitle": "Hlavní Podnázev"
              },
              {
                $: { type: 'alternative' },
                "mods:title": "Alternativní Název"
              }
            ]
          }
        ]
      }
    };
    const result = await parseModsTitles(mods, 'cs');
    expect(result).toBe('Hlavní Název: Hlavní Podnázev.');
  });

  it('správně zpracuje titul s částí (partNumber a partName)', async () => {
    const mods = {
      "mods:modsCollection": {
        "mods:mods": [
          {
            "mods:titleInfo": [
              {
                "mods:title": "Název Knihy",
                "mods:partNumber": "II",
                "mods:partName": "Druhá část"
              }
            ]
          }
        ]
      }
    };
    const result = await parseModsTitles(mods, 'cs');
    expect(result).toBe('Název Knihy. část II. Druhá část.');
  });

  it('správně zpracuje kombinaci různých elementů', async () => {
    const mods = {
      "mods:modsCollection": {
        "mods:mods": [
          {
            "mods:titleInfo": [
              {
                "mods:title": "Název Knihy",
                "mods:subTitle": "Podnázev",
                "mods:partNumber": "III",
                "mods:partName": "Třetí část"
              }
            ]
          }
        ]
      }
    };
    const result = await parseModsTitles(mods, 'cs');
    expect(result).toBe('Název Knihy: Podnázev. část III. Třetí část.');
  });
});
