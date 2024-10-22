// tests/parseModsPublisher.test.ts
import { parseModsPublisher } from '../src/services/modsParser';
import { getLocale } from '../src/locales';

jest.mock('../src/locales', () => ({
  getLocale: jest.fn(),
}));

describe('parseModsPublisher', () => {
  beforeEach(() => {
    // Mock getLocale není zde používán, ale můžete jej přidat, pokud funkce používá lokální informace
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('vrátí prázdné hodnoty, pokud není originInfo', async () => {
    const mods = {
      "mods:modsCollection": {
        "mods:mods": [{}]
      }
    };
    const result = await parseModsPublisher(mods, 'cs');
    expect(result).toEqual({ txt: '', bibtex: '' });
  });

  it('vrátí prázdné hodnoty, pokud originInfo neobsahuje potřebná data', async () => {
    const mods = {
      "mods:modsCollection": {
        "mods:mods": [
          {
            "mods:originInfo": [{}]
          }
        ]
      }
    };
    const result = await parseModsPublisher(mods, 'cs');
    expect(result).toEqual({ txt: '', bibtex: '' });
  });

  it('správně zpracuje originInfo s místem, vydavatelem a datem vydání', async () => {
    const mods = {
      "mods:modsCollection": {
        "mods:mods": [
          {
            "mods:originInfo": [
              {
                "mods:place": [
                  {
                    "mods:placeTerm": [
                      { _: 'Praha', $: { authority: 'local' } }
                    ]
                  }
                ],
                "mods:publisher": ['Nakladatelství'],
                "mods:dateIssued": ['2023']
              }
            ]
          }
        ]
      }
    };
    const result = await parseModsPublisher(mods, 'cs');
    expect(result).toEqual({ 
      txt: 'Praha: Nakladatelství, 2023.', 
      bibtex: 'address = {Praha}, publisher = {Nakladatelství}, year = {2023}, ' 
    });
  });

  it('správně zpracuje originInfo s edicí', async () => {
    const mods = {
      "mods:modsCollection": {
        "mods:mods": [
          {
            "mods:originInfo": [
              {
                "mods:place": [
                  {
                    "mods:placeTerm": [
                      { _: 'Brno', $: { authority: 'local' } }
                    ]
                  }
                ],
                "mods:publisher": ['Vydavatel'],
                "mods:dateIssued": ['2021'],
                "mods:edition": ['2. vydání']
              }
            ]
          }
        ]
      }
    };
    const result = await parseModsPublisher(mods, 'cs');
    expect(result).toEqual({ 
      txt: '2. vydání. Brno: Vydavatel, 2021.', 
      bibtex: 'edition = {2. vydání}, address = {Brno}, publisher = {Vydavatel}, year = {2021}, ' 
    });
  });

  it('správně zpracuje více dat vydání s různými formáty', async () => {
    const mods = {
      "mods:modsCollection": {
        "mods:mods": [
          {
            "mods:originInfo": [
              {
                "mods:place": [
                  {
                    "mods:placeTerm": [
                      { _: 'Olomouc', $: { authority: 'local' } }
                    ]
                  }
                ],
                "mods:publisher": ['Nakladatel'],
                "mods:dateIssued": [
                  { _: '2019', $: { encoding: 'marc' } },
                  { _: '2020', $: { encoding: 'iso' } }
                ]
              }
            ]
          }
        ]
      }
    };
    const result = await parseModsPublisher(mods, 'cs');
    expect(result).toEqual({ 
      txt: 'Olomouc: Nakladatel, 2019.', 
      bibtex: 'address = {Olomouc}, publisher = {Nakladatel}, year = {2019}, ' 
    });
  });

  it('ignoruje místa s authority "marccountry"', async () => {
    const mods = {
      "mods:modsCollection": {
        "mods:mods": [
          {
            "mods:originInfo": [
              {
                "mods:place": [
                  {
                    "mods:placeTerm": [
                      { _: 'Česká republika', $: { authority: 'marccountry' } }
                    ]
                  }
                ],
                "mods:publisher": ['Nakladatelství'],
                "mods:dateIssued": ['2022']
              }
            ]
          }
        ]
      }
    };
    const result = await parseModsPublisher(mods, 'cs');
    expect(result).toEqual({ 
      txt: 'Nakladatelství, 2022.', 
      bibtex: 'publisher = {Nakladatelství}, year = {2022}, ' 
    });
  });
});
