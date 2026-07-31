import { parseStringPromise } from 'xml2js';
import {
  parseDoi,
  parseModsAuthors,
  parseModsCartographics,
  parseModsPublisher,
  parseModsTitles,
  parsePhysicalDescription,
} from '../src/services/modsParser';

const prefixedMods = `
<mods:modsCollection xmlns:mods="http://www.loc.gov/mods/v3">
  <mods:mods>
    <mods:titleInfo><mods:title>Test title</mods:title></mods:titleInfo>
    <mods:name type="personal">
      <mods:namePart type="family">Novák</mods:namePart>
      <mods:namePart type="given">Jan</mods:namePart>
    </mods:name>
    <mods:originInfo>
      <mods:place><mods:placeTerm type="text">Brno</mods:placeTerm></mods:place>
      <mods:publisher>Test publisher</mods:publisher>
      <mods:dateIssued>2026</mods:dateIssued>
    </mods:originInfo>
    <mods:subject><mods:cartographics><mods:scale>1:1000</mods:scale></mods:cartographics></mods:subject>
    <mods:physicalDescription><mods:extent>1 photograph</mods:extent></mods:physicalDescription>
    <mods:identifier type="doi">10.1234/test</mods:identifier>
  </mods:mods>
</mods:modsCollection>`;

const unprefixedMods = `
<modsCollection xmlns="http://www.loc.gov/mods/v3">
  <mods>
    <titleInfo><title>Test title</title></titleInfo>
    <name type="personal">
      <namePart type="family">Novák</namePart>
      <namePart type="given">Jan</namePart>
    </name>
    <originInfo>
      <place><placeTerm type="text">Brno</placeTerm></place>
      <publisher>Test publisher</publisher>
      <dateIssued>2026</dateIssued>
    </originInfo>
    <subject><cartographics><scale>1:1000</scale></cartographics></subject>
    <physicalDescription><extent>1 photograph</extent></physicalDescription>
    <identifier type="doi">10.1234/test</identifier>
  </mods>
</modsCollection>`;

async function parseAll(xml: string) {
  const mods = await parseStringPromise(xml, { explicitArray: true });

  return {
    authors: await parseModsAuthors(mods, 'cs'),
    titles: await parseModsTitles(mods, 'cs'),
    publisher: await parseModsPublisher(mods, 'cs'),
    cartographics: await parseModsCartographics(mods, 'cs'),
    physicalDescription: parsePhysicalDescription(mods, 'cs'),
    doi: parseDoi(mods),
  };
}

describe('MODS namespace variants', () => {
  it('parses prefixed and default-namespace MODS identically', async () => {
    const prefixed = await parseAll(prefixedMods);
    const unprefixed = await parseAll(unprefixedMods);

    expect(unprefixed).toEqual(prefixed);
    expect(unprefixed.authors.iso).toBe('NOVÁK, Jan.');
    expect(unprefixed.titles.txt).toBe('Test title.');
    expect(unprefixed.publisher.iso).toBe('Brno: Test publisher, 2026.');
    expect(unprefixed.cartographics).toBe('1:1000.');
    expect(unprefixed.physicalDescription).toBe('1 photograph.');
    expect(unprefixed.doi).toBe('10.1234/test');
  });
});
