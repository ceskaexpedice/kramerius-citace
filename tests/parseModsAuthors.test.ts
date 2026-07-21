// tests/parseModsAuthors.test.ts
import { parseModsAuthors } from '../src/services/modsParser';
import { getLocale } from '../src/locales';

jest.mock('../src/locales', () => ({
  getLocale: jest.fn(),
}));

describe('parseModsAuthors', () => {
  beforeEach(() => {
    // Nastavení mockované lokality
    (getLocale as jest.Mock).mockReturnValue({ and: 'a' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('vrátí prázdné hodnoty, pokud nejsou autoři', async () => {
    const mods = {
      "mods:modsCollection": {
        "mods:mods": [{}]
      }
    };
    const result = await parseModsAuthors(mods, 'cs');
    expect(result).toEqual({ txt: '', bibtex: '' });
  });

  it('správně zpracuje jednoho autora s family a given jménem', async () => {
    const mods = {
      "mods:modsCollection": {
        "mods:mods": [
          {
            "mods:name": [
              {
                "mods:namePart": [
                  { $: { type: 'family' }, _: 'Novák' },
                  { $: { type: 'given' }, _: 'Jan' }
                ]
              }
            ]
          }
        ]
      }
    };
    const result = await parseModsAuthors(mods, 'cs');
    expect(result).toEqual({ txt: 'NOVÁK, Jan.', bibtex: 'NOVÁK, Jan' });
  });

  it('správně zpracuje jednoho autora bez given jména', async () => {
    const mods = {
      "mods:modsCollection": {
        "mods:mods": [
          {
            "mods:name": [
              {
                "mods:namePart": [
                  { $: { type: 'family' }, _: 'Novák' }
                ]
              }
            ]
          }
        ]
      }
    };
    const result = await parseModsAuthors(mods, 'cs');
    expect(result).toEqual({ txt: 'Novák.', bibtex: 'Novák' });
  });

  it('správně zpracuje více autorů (méně než 4)', async () => {
    const mods = {
      "mods:modsCollection": {
        "mods:mods": [
          {
            "mods:name": [
              {
                "mods:namePart": [
                  { $: { type: 'family' }, _: 'Novák' },
                  { $: { type: 'given' }, _: 'Jan' }
                ]
              },
              {
                "mods:namePart": [
                  { $: { type: 'family' }, _: 'Svoboda' },
                  { $: { type: 'given' }, _: 'Petr' }
                ]
              },
              {
                "mods:namePart": [
                  { $: { type: 'family' }, _: 'Dvořák' },
                  { $: { type: 'given' }, _: 'Pavel' }
                ]
              }
            ]
          }
        ]
      }
    };
    const result = await parseModsAuthors(mods, 'cs');
    expect(result).toEqual({ 
      txt: 'NOVÁK, Jan, SVOBODA, Petr a DVOŘÁK, Pavel.', 
      bibtex: 'NOVÁK, Jan and SVOBODA, Petr and DVOŘÁK, Pavel' 
    });
  });

  it('správně zpracuje více než 4 autorů', async () => {
    const mods = {
      "mods:modsCollection": {
        "mods:mods": [
          {
            "mods:name": [
              { "mods:namePart": [{ $: { type: 'family' }, _: 'Novák' }, { $: { type: 'given' }, _: 'Jan' }] },
              { "mods:namePart": [{ $: { type: 'family' }, _: 'Svoboda' }, { $: { type: 'given' }, _: 'Petr' }] },
              { "mods:namePart": [{ $: { type: 'family' }, _: 'Dvořák' }, { $: { type: 'given' }, _: 'Pavel' }] },
              { "mods:namePart": [{ $: { type: 'family' }, _: 'Horák' }, { $: { type: 'given' }, _: 'Tomáš' }] },
              { "mods:namePart": [{ $: { type: 'family' }, _: 'Král' }, { $: { type: 'given' }, _: 'Lukáš' }] }
            ]
          }
        ]
      }
    };
    const result = await parseModsAuthors(mods, 'cs');
    expect(result).toEqual({ 
      txt: 'NOVÁK, Jan et al.', 
      bibtex: 'NOVÁK, Jan and others' 
    });
  });

  it('správně zpracuje autory s různými formáty jmen', async () => {
    const mods = {
      "mods:modsCollection": {
        "mods:mods": [
          {
            "mods:name": [
              {
                "mods:namePart": ['Novák, Jan']
              },
              {
                "mods:namePart": [
                  { $: { type: 'family' }, _: 'Svoboda' },
                  { $: { type: 'given' }, _: 'Petr' }
                ]
              }
            ]
          }
        ]
      }
    };
    const result = await parseModsAuthors(mods, 'cs');
    expect(result).toEqual({ 
      txt: 'NOVÁK, Jan a SVOBODA, Petr.', 
      bibtex: 'NOVÁK, Jan and SVOBODA, Petr' 
    });
  });
});
