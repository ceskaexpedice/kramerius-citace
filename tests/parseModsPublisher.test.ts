// tests/parseModsPublisher.test.ts
// Používá skutečný český locale (locales/cs.json), aby test hlídal i wiki a RIS výstup.
import { parseModsPublisher } from '../src/services/modsParser';

function modsWithOriginInfo(originInfo: any) {
  return {
    'mods:modsCollection': {
      'mods:mods': [{ 'mods:originInfo': [originInfo] }],
    },
  };
}

const place = (name: string, authority = 'local') => ({
  'mods:placeTerm': [{ _: name, $: { authority } }],
});

describe('parseModsPublisher', () => {
  it('vrátí prázdné hodnoty ve všech formátech, pokud není originInfo', async () => {
    const mods = { 'mods:modsCollection': { 'mods:mods': [{}] } };
    expect(await parseModsPublisher(mods, 'cs')).toEqual({ iso: '', mla: '', bibtex: '', wiki: '', ris: '' });
  });

  it('vrátí prázdné hodnoty, pokud originInfo neobsahuje potřebná data', async () => {
    expect(await parseModsPublisher(modsWithOriginInfo({}), 'cs')).toEqual({ iso: '', mla: '', bibtex: '', wiki: '', ris: '' });
  });

  it('správně zpracuje originInfo s místem, vydavatelem a datem vydání', async () => {
    const result = await parseModsPublisher(modsWithOriginInfo({
      'mods:place': [place('Praha')],
      'mods:publisher': ['Nakladatelství'],
      'mods:dateIssued': ['2023'],
    }), 'cs');
    expect(result).toEqual({
      iso: 'Praha: Nakladatelství, 2023.',
      mla: 'Nakladatelství, 2023.',
      bibtex: 'address = {Praha}, publisher = {Nakladatelství}, year = {2023}, ',
      wiki: 'místo = Praha | vydavatel = Nakladatelství | rok vydání = 2023 | ',
      ris: 'PP  - Praha\nPB  - Nakladatelství\nPY  - 2023\n',
    });
  });

  it('správně zpracuje originInfo s edicí', async () => {
    const result = await parseModsPublisher(modsWithOriginInfo({
      'mods:place': [place('Brno')],
      'mods:publisher': ['Vydavatel'],
      'mods:dateIssued': ['2021'],
      'mods:edition': ['2. vydání'],
    }), 'cs');
    expect(result.iso).toBe('2. vydání. Brno: Vydavatel, 2021.');
    expect(result.bibtex).toBe('edition = {2. vydání}, address = {Brno}, publisher = {Vydavatel}, year = {2021}, ');
  });

  it('z více dat vydání použije to s encoding="marc"', async () => {
    const result = await parseModsPublisher(modsWithOriginInfo({
      'mods:place': [place('Olomouc')],
      'mods:publisher': ['Nakladatel'],
      'mods:dateIssued': [
        { _: '2019', $: { encoding: 'marc' } },
        { _: '2020', $: { encoding: 'iso' } },
      ],
    }), 'cs');
    expect(result.iso).toBe('Olomouc: Nakladatel, 2019.');
    expect(result.bibtex).toBe('address = {Olomouc}, publisher = {Nakladatel}, year = {2019}, ');
  });

  it('zachová rok i u jediného dateIssued s atributy', async () => {
    const result = await parseModsPublisher(modsWithOriginInfo({
      'mods:place': [place('Praha')],
      'mods:publisher': ['Odeon'],
      'mods:dateIssued': [{ _: '1959', $: { encoding: 'marc' } }],
      'mods:edition': [{ _: '1. vyd.', $: { lang: 'cs' } }],
    }), 'cs');
    expect(result.iso).toBe('1. vyd. Praha: Odeon, 1959.');
    expect(result.wiki).toBe('vydání = 1. vyd. | místo = Praha | vydavatel = Odeon | rok vydání = 1959 | ');
  });

  it('použije rozmezí let z dateIssued point="start"/"end"', async () => {
    const result = await parseModsPublisher(modsWithOriginInfo({
      'mods:publisher': ['Nakladatel'],
      'mods:dateIssued': [
        { _: '1904', $: { encoding: 'marc', point: 'start' } },
        { _: '1905', $: { encoding: 'marc', point: 'end' } },
      ],
    }), 'cs');
    expect(result.iso).toBe('Nakladatel, 1904-1905.');
    expect(result.ris).toBe('PB  - Nakladatel\nY1  - 1904\nY2  - 1905\n');
  });

  it('ignoruje místa s authority "marccountry"', async () => {
    const result = await parseModsPublisher(modsWithOriginInfo({
      'mods:place': [place('Česká republika', 'marccountry')],
      'mods:publisher': ['Nakladatelství'],
      'mods:dateIssued': ['2022'],
    }), 'cs');
    expect(result.iso).toBe('Nakladatelství, 2022.');
    expect(result.bibtex).toBe('publisher = {Nakladatelství}, year = {2022}, ');
  });

  it('doplní číslo stránky', async () => {
    const result = await parseModsPublisher(modsWithOriginInfo({
      'mods:publisher': ['Nakladatelství'],
      'mods:dateIssued': ['2022'],
    }), 'cs', '15');
    expect(result.iso).toBe('Nakladatelství, 2022, s. 15.');
    expect(result.wiki).toBe('vydavatel = Nakladatelství | rok vydání = 2022 | strany = 15 | ');
  });
});
