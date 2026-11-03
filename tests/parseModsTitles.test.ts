// tests/parseModsTitles.test.ts
import { parseModsTitles } from '../src/services/modsParser';
import { getLocale } from '../src/locales';

jest.mock('../src/locales', () => ({
  getLocale: jest.fn(),
}));

function modsWithTitles(titleInfo: any[]) {
  return {
    'mods:modsCollection': {
      'mods:mods': [{ 'mods:titleInfo': titleInfo }],
    },
  };
}

describe('parseModsTitles', () => {
  beforeEach(() => {
    (getLocale as jest.Mock).mockReturnValue({ part: 'část', wiki: { title: 'titul' } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('vrátí prázdný řetězec, pokud nejsou titulní informace', async () => {
    const mods = { 'mods:modsCollection': { 'mods:mods': [{}] } };
    expect(await parseModsTitles(mods, 'cs')).toBe('');
  });

  it('vrátí název ve všech formátech', async () => {
    const result = await parseModsTitles(modsWithTitles([{ 'mods:title': 'Název Knihy' }]), 'cs');
    expect(result).toEqual({
      txt: 'Název Knihy.',
      wiki: 'titul = Název Knihy. | ',
      ris: 'TI  - Název Knihy.\n',
    });
  });

  it('správně zpracuje jeden hlavní titul s podnázvem', async () => {
    const result = await parseModsTitles(
      modsWithTitles([{ 'mods:title': 'Název Knihy', 'mods:subTitle': 'Podnázev Knihy' }]),
      'cs',
    );
    expect(result.txt).toBe('Název Knihy: Podnázev Knihy.');
  });

  it('přeskočí alternativní a uniformní názvy', async () => {
    const result = await parseModsTitles(
      modsWithTitles([
        { 'mods:title': 'Hlavní Název', 'mods:subTitle': 'Hlavní Podnázev' },
        { $: { type: 'alternative' }, 'mods:title': 'Alternativní Název' },
        { $: { nameTitleGroup: '1' }, 'mods:title': 'Uniformní Název' },
      ]),
      'cs',
    );
    expect(result.txt).toBe('Hlavní Název: Hlavní Podnázev.');
  });

  it('správně zpracuje titul s částí (partNumber a partName)', async () => {
    const result = await parseModsTitles(
      modsWithTitles([{ 'mods:title': 'Název Knihy', 'mods:partNumber': 'II', 'mods:partName': 'Druhá část' }]),
      'cs',
    );
    expect(result.txt).toBe('Název Knihy. část II. Druhá část.');
  });

  it('nezdvojuje označení dílu, pokud už je v partNumber', async () => {
    const result = await parseModsTitles(
      modsWithTitles([{ 'mods:title': 'Název Knihy', 'mods:partNumber': 'Díl 2' }]),
      'cs',
    );
    expect(result.txt).toBe('Název Knihy. Díl 2.');
  });

  it('správně zpracuje kombinaci různých elementů', async () => {
    const result = await parseModsTitles(
      modsWithTitles([{
        'mods:title': 'Název Knihy',
        'mods:subTitle': 'Podnázev',
        'mods:partNumber': 'III',
        'mods:partName': 'Třetí část',
      }]),
      'cs',
    );
    expect(result.txt).toBe('Název Knihy: Podnázev. část III. Třetí část.');
  });
});
