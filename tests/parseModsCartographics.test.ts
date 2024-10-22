// tests/parseModsCartographics.test.ts
import { parseModsCartographics } from '../src/services/modsParser';

describe('parseModsCartographics', () => {
  it('vrátí prázdný řetězec, pokud nejsou kartografické informace', async () => {
    const mods = {
      "mods:modsCollection": {
        "mods:mods": [{}]
      }
    };
    const result = await parseModsCartographics(mods, 'cs');
    expect(result).toBe('');
  });

  it('správně zpracuje jedno měřítko s prefixem "Měřítko "', async () => {
    const mods = {
      "mods:modsCollection": {
        "mods:mods": [
          {
            "mods:subject": [
              {
                "mods:cartographics": [
                  {
                    "mods:scale": ['Měřítko 1:1000']
                  }
                ]
              }
            ]
          }
        ]
      }
    };
    const result = await parseModsCartographics(mods, 'cs');
    expect(result).toBe('1:1000.');
  });

  it('správně zpracuje jedno měřítko bez prefixu', async () => {
    const mods = {
      "mods:modsCollection": {
        "mods:mods": [
          {
            "mods:subject": [
              {
                "mods:cartographics": [
                  {
                    "mods:scale": ['1:500']
                  }
                ]
              }
            ]
          }
        ]
      }
    };
    const result = await parseModsCartographics(mods, 'cs');
    expect(result).toBe('1:500.');
  });

  it('správně zpracuje více měřítek', async () => {
    const mods = {
      "mods:modsCollection": {
        "mods:mods": [
          {
            "mods:subject": [
              {
                "mods:cartographics": [
                  {
                    "mods:scale": ['Měřítko 1:1000', 'Měřítko 1:5000']
                  },
                  {
                    "mods:scale": ['Měřítko 1:2500']
                  }
                ]
              }
            ]
          }
        ]
      }
    };
    const result = await parseModsCartographics(mods, 'cs');
    expect(result).toBe('1:1000.1:5000.1:2500.');
  });

  it('správně zpracuje měřítka s různými formáty', async () => {
    const mods = {
      "mods:modsCollection": {
        "mods:mods": [
          {
            "mods:subject": [
              {
                "mods:cartographics": [
                  {
                    "mods:scale": ['Měřítko 1:1000', '2:500']
                  }
                ]
              }
            ]
          }
        ]
      }
    };
    const result = await parseModsCartographics(mods, 'cs');
    expect(result).toBe('1:1000.2:500.');
  });

  // it('ignoruje neplatné měřítka', async () => {
  //   const mods = {
  //     "mods:modsCollection": {
  //       "mods:mods": [
  //         {
  //           "mods:subject": [
  //             {
  //               "mods:cartographics": [
  //                 {
  //                   "mods:scale": ['Měřítko 1:1000', null, 123, 'Měřítko ']
  //                 }
  //               ]
  //             }
  //           ]
  //         }
  //       ]
  //     }
  //   };
  //   const result = await parseModsCartographics(mods, 'cs');
  //   expect(result).toBe('1:1000.');
  // });
});
