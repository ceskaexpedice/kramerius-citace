import axios from 'axios';
import { getCitation } from '../src/services/citationService';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

function responseMock() {
  const response: any = {};
  response.status = jest.fn(() => response);
  response.json = jest.fn(() => response);
  response.send = jest.fn(() => response);
  response.set = jest.fn(() => response);
  return response;
}

describe('citation role integration', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('aplikuje roles=true jako výchozí ve všech exportech a vrátí debug diagnostiku', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({
        data: {
          response: {
            docs: [
              {
                model: 'monograph',
                pid: 'uuid:test',
              },
            ],
          },
        },
      })
      .mockResolvedValueOnce({
        data: `
          <mods:modsCollection xmlns:mods="http://www.loc.gov/mods/v3">
            <mods:mods>
              <mods:titleInfo><mods:title>Testovací kniha</mods:title></mods:titleInfo>
              <mods:name type="personal" usage="primary">
                <mods:namePart type="family">Novák</mods:namePart>
                <mods:namePart type="given">Jan</mods:namePart>
                <mods:role><mods:roleTerm authority="marcrelator" type="code">aut</mods:roleTerm></mods:role>
              </mods:name>
              <mods:name type="personal">
                <mods:namePart type="family">Překladatel</mods:namePart>
                <mods:namePart type="given">Petr</mods:namePart>
                <mods:role><mods:roleTerm authority="marcrelator" type="code">trl</mods:roleTerm></mods:role>
              </mods:name>
              <mods:name type="corporate">
                <mods:namePart>Nakladatel uvedený ve jménu</mods:namePart>
                <mods:role><mods:roleTerm authority="marcrelator" type="code">pbl</mods:roleTerm></mods:role>
              </mods:name>
              <mods:originInfo>
                <mods:place><mods:placeTerm type="text">Brno</mods:placeTerm></mods:place>
                <mods:publisher>Test publisher</mods:publisher>
                <mods:dateIssued>2026</mods:dateIssued>
              </mods:originInfo>
            </mods:mods>
          </mods:modsCollection>
        `,
      });

    const request: any = {
      query: {
        uuid: 'uuid:test',
        url: 'https://example.test',
        exp: 'all',
        debug: 'true',
        lang: 'cs',
      },
    };
    const response = responseMock();

    await getCitation(request, response);

    const body = response.json.mock.calls[0][0];
    expect(body.citation.iso690).toContain('NOVÁK, Jan. Testovací kniha.');
    expect(body.citation.iso690).toContain('Petr PŘEKLADATEL (překl.).');
    expect(body.citation.iso690).not.toContain('Nakladatel uvedený ve jménu');
    expect(body.citation.bibtex).toContain('author = {{Novák}, Jan}');
    expect(body.citation.bibtex).toContain('translator = {{Překladatel}, Petr}');
    expect(body.citation.ris).toContain('AU  - Novák, Jan');
    expect(body.citation.ris).toContain('A3  - Překladatel, Petr');
    expect(body.roleDiagnostics.current.namesUsed).toBe(2);
    expect(body.roleDiagnostics.current.namesExcluded).toBe(1);
  });
});
