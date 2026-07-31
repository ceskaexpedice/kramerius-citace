import { parseModsAuthors } from '../src/services/modsParser';

const emptyAuthors = {
  iso: '',
  mla: '',
  bibtex: '',
  wiki: '',
  ris: '',
};

function role(code: string, authority = 'marcrelator') {
  return {
    'mods:roleTerm': [
      {
        $: { authority, type: 'code' },
        _: code,
      },
    ],
  };
}

function textRole(label: string) {
  return {
    'mods:roleTerm': [
      {
        $: { authority: 'marcrelator', type: 'text' },
        _: label,
      },
    ],
  };
}

function name(
  family: string,
  given: string,
  roleCodes?: string[],
  type = 'personal',
  usage?: string,
) {
  const value: any = {
    $: { type, ...(usage ? { usage } : {}) },
    'mods:namePart': type === 'personal'
      ? [
          { $: { type: 'family' }, _: family },
          { $: { type: 'given' }, _: given },
        ]
      : [family],
  };

  if (roleCodes) value['mods:role'] = roleCodes.map((code) => role(code));
  return value;
}

function mods(names?: any[]) {
  return {
    'mods:modsCollection': {
      'mods:mods': [
        names ? { 'mods:name': names } : {},
      ],
    },
  };
}

describe('parseModsAuthors', () => {
  it('vrátí prázdné hodnoty, pokud nejsou žádná jména', async () => {
    expect(await parseModsAuthors(mods(), 'cs')).toEqual(emptyAuthors);
  });

  it('při roles=false zachová původní chování', async () => {
    const result = await parseModsAuthors(
      mods([
        name('Novák', 'Jan', ['aut']),
        name('Nakladatel', 'Petr', ['pbl']),
      ]),
      'cs',
    );

    expect(result.iso).toBe('NOVÁK, Jan a NAKLADATEL, Petr.');
  });

  it('v ISO odděluje tři a více hlavních tvůrců středníky', async () => {
    const names = [
      name('Novák', 'Jan', ['aut']),
      name('Svoboda', 'Petr', ['aut']),
      name('Dvořák', 'Karel', ['aut']),
    ];

    const legacy = await parseModsAuthors(mods(names), 'cs');
    const roleAware = await parseModsAuthors(
      mods(names),
      'cs',
      { filterByRoles: true },
    );

    expect(legacy.iso).toBe('NOVÁK, Jan; SVOBODA, Petr a DVOŘÁK, Karel.');
    expect(roleAware.iso).toBe('NOVÁK, Jan; SVOBODA, Petr a DVOŘÁK, Karel.');
  });

  it('rozdělí primární, vedlejší, imprint a vyloučené role', async () => {
    const result = await parseModsAuthors(
      mods([
        name('Novák', 'Jan', ['AUT.']),
        name('Překladatel', 'Petr', ['trl']),
        name('Ilustrátor', 'Ivan', ['ill']),
        name('Nakladatelství', '', ['pbl'], 'corporate'),
        name('Vlastník', 'Václav', ['own']),
        name('Neznámý', 'Karel', ['xyz']),
      ]),
      'cs',
      { filterByRoles: true, model: 'monograph' },
    );

    expect(result.iso).toBe('NOVÁK, Jan.');
    expect(result.secondary?.iso).toContain('Petr PŘEKLADATEL (překl.).');
    expect(result.secondary?.iso).toContain('Ivan ILUSTRÁTOR (il.).');
    expect(result.secondary?.iso).not.toContain('Karel NEZNÁMÝ');
    expect(result.secondary?.iso).not.toContain('Nakladatelství');
    expect(result.secondary?.iso).not.toContain('Vlastník');
    expect(result.bibtexFields).toContain('author = {{Novák}, Jan}');
    expect(result.bibtexFields).toContain('translator = {{Překladatel}, Petr}');
    expect(result.bibtexFields).toContain('keywords = {needs-review}');
    expect(result.ris).toContain('AU  - Novák, Jan');
    expect(result.ris).toContain('A3  - Překladatel, Petr');
    expect(result.imprintPublishers).toEqual(['Nakladatelství']);
    expect(result.diagnostics?.namesUsed).toBe(3);
    expect(result.diagnostics?.namesExcluded).toBe(3);
  });

  it('u více rolí vybere slot s nejvyšší prioritou', async () => {
    const result = await parseModsAuthors(
      mods([name('Novák', 'Jan', ['pbl', 'aut'])]),
      'cs',
      { filterByRoles: true },
    );

    expect(result.iso).toBe('NOVÁK, Jan.');
  });

  it('zachová více vedlejších rolí jednoho jména ve formátových výstupech', async () => {
    const result = await parseModsAuthors(
      mods([
        name('Novák', 'Jan', ['aut']),
        name('Tvůrce', 'Petr', ['trl', 'ill']),
      ]),
      'cs',
      { filterByRoles: true },
    );

    expect(result.secondary?.iso).toContain('Petr TVŮRCE (překl., il.).');
    expect(result.wiki).toContain('translator-last1 = Tvůrce');
    expect(result.wiki).toContain('others = Ilustroval: Petr Tvůrce');
    expect(result.ris).toContain('Role: trl, ill — Tvůrce, Petr');
  });

  it('v ISO zkracuje pouze editora, překladatele a ilustrátora', async () => {
    const result = await parseModsAuthors(
      mods([
        name('Novák', 'Jan', ['aut']),
        name('Editor', 'Eva', ['edt']),
        name('Překladatel', 'Petr', ['trl']),
        name('Ilustrátor', 'Ivan', ['ill']),
        name('Fotograf', 'Filip', ['pht']),
      ]),
      'cs',
      { filterByRoles: true },
    );

    expect(result.secondary?.iso).toBe(
      'Eva EDITOR (ed.). Petr PŘEKLADATEL (překl.). Ivan ILUSTRÁTOR (il.). Filip FOTOGRAF (fotograf).',
    );
  });

  it('u částečných rolí vyřadí jména bez role a vždy vyřadí pbl', async () => {
    const result = await parseModsAuthors(
      mods([
        name('Novák', 'Jan', ['aut']),
        name('Svoboda', 'Petr'),
        name('Nakladatel', 'Karel', ['pbl']),
      ]),
      'cs',
      { filterByRoles: true },
    );

    expect(result.iso).toBe('NOVÁK, Jan.');
    expect(result.secondary?.iso).toBe('');
    expect(result.diagnostics?.entries[1].slot).toBe('excluded');
    expect(result.diagnostics?.entries[1].inferenceRule).toBe('R4');
    expect(result.diagnostics?.needsReview).toBe(true);
  });

  it('použije usage=primary jako pravidlo R1', async () => {
    const result = await parseModsAuthors(
      mods([
        name('Primární', 'Pavel', undefined, 'personal', 'primary'),
        name('Nakladatelství', '', ['pbl'], 'corporate'),
      ]),
      'cs',
      { filterByRoles: true },
    );

    expect(result.iso).toBe('PRIMÁRNÍ, Pavel.');
    expect(result.diagnostics?.entries[0].inferenceRule).toBe('R1');
    expect(result.diagnostics?.entries[0].confidence).toBe('inferred');
  });

  it('jediné corporate jméno bez role vyloučí', async () => {
    const result = await parseModsAuthors(
      mods([name('Městské muzeum', '', undefined, 'corporate')]),
      'cs',
      { filterByRoles: true },
    );

    expect(result.iso).toBe('');
    expect(result.diagnostics?.entries[0].slot).toBe('excluded');
    expect(result.diagnostics?.namesExcluded).toBe(1);
  });

  it('conference jméno nikdy nezahrne do autorské části', async () => {
    const conference = name(
      'Konference o knihovnách (2026 : Brno, Česko)',
      '',
      ['aut'],
      'conference',
    );

    const roleAware = await parseModsAuthors(
      mods([
        conference,
        name('Novák', 'Jan', ['aut']),
      ]),
      'cs',
      { filterByRoles: true },
    );
    const legacy = await parseModsAuthors(
      mods([
        conference,
        name('Novák', 'Jan', ['aut']),
      ]),
      'cs',
    );

    expect(roleAware.iso).toBe('NOVÁK, Jan.');
    expect(roleAware.diagnostics?.entries[0].slot).toBe('excluded');
    expect(roleAware.diagnostics?.namesExcluded).toBe(1);
    expect(legacy.iso).toBe('NOVÁK, Jan.');
  });

  it('corporate jméno bez role vedle osobního autora vyloučí', async () => {
    const result = await parseModsAuthors(
      mods([
        name('Novák', 'Jan', ['aut']),
        name('Městské muzeum', '', undefined, 'corporate'),
      ]),
      'cs',
      { filterByRoles: true },
    );

    expect(result.iso).toBe('NOVÁK, Jan.');
    expect(result.secondary?.iso).not.toContain('Městské muzeum');
    expect(result.diagnostics?.entries[1].slot).toBe('excluded');
  });

  it('pokud nemá roli nikdo, určí prvního osobního autora podle R5', async () => {
    const result = await parseModsAuthors(
      mods([
        name('Muzeum', '', undefined, 'corporate'),
        name('Novák', 'Jan'),
        name('Svoboda', 'Petr'),
      ]),
      'cs',
      { filterByRoles: true },
    );

    expect(result.iso).toBe('NOVÁK, Jan.');
    expect(result.diagnostics?.entries[1].inferenceRule).toBe('R5');
    expect(result.secondary?.iso).not.toContain('Muzeum');
    expect(result.secondary?.iso).not.toContain('Petr SVOBODA');
    expect(result.diagnostics?.entries[2].slot).toBe('excluded');
  });

  it('vyřadí obecnou roli oth místo označení přispěvatel', async () => {
    const result = await parseModsAuthors(
      mods([
        name('Novák', 'Jan', ['aut']),
        name('Jiný', 'Petr', ['oth']),
      ]),
      'cs',
      { filterByRoles: true },
    );

    expect(result.iso).toBe('NOVÁK, Jan.');
    expect(result.secondary?.iso).toBe('');
    expect(result.diagnostics?.entries[1].slot).toBe('excluded');
    expect(result.diagnostics?.needsReview).toBe(true);
  });

  it('deduplikuje jméno a přednostně zachová variantu s rolí', async () => {
    const result = await parseModsAuthors(
      mods([
        {
          $: { type: 'personal' },
          'mods:namePart': ['Pavel, Josef,'],
        },
        name('Pavel', 'Josef', ['aut']),
      ]),
      'cs',
      { filterByRoles: true },
    );

    expect(result.iso).toBe('PAVEL, Josef.');
    expect(result.diagnostics?.dropped).toEqual([
      { displayName: 'Pavel, Josef', position: 0, reason: 'R3' },
    ]);
  });

  it('povýší modelově závislou roli pouze u odpovídajícího dokumentu', async () => {
    const sheetMusic = await parseModsAuthors(
      mods([name('Skladatel', 'Adam', ['cmp'])]),
      'cs',
      { filterByRoles: true, model: 'sheetmusic' },
    );
    const monograph = await parseModsAuthors(
      mods([name('Skladatel', 'Adam', ['cmp'])]),
      'cs',
      { filterByRoles: true, model: 'monograph' },
    );

    expect(sheetMusic.iso).toBe('SKLADATEL, Adam.');
    expect(monograph.iso).toBe('');
    expect(monograph.secondary?.iso).toContain('Adam SKLADATEL (skladatel)');
  });

  it('může modelově závislou roli povýšit také podle žánru', async () => {
    const interviewMods: any = mods([name('Zpovídaný', 'Jan', ['ive'])]);
    interviewMods['mods:modsCollection']['mods:mods'][0]['mods:genre'] = ['rozhovory'];

    const result = await parseModsAuthors(
      interviewMods,
      'cs',
      { filterByRoles: true, model: 'monograph' },
    );

    expect(result.iso).toBe('ZPOVÍDANÝ, Jan.');
  });

  it('použije režiséra jako prvního tvůrce, pokud hlavní tvůrce chybí', async () => {
    const result = await parseModsAuthors(
      mods([name('Kachyňa', 'Karel', ['drt'])]),
      'cs',
      { filterByRoles: true, model: 'monograph' },
    );

    expect(result.iso).toBe('KACHYŇA, Karel (režisér).');
    expect(result.secondary?.iso).toBe('');
  });

  it('mapuje osamocený český textový termín a označí jej ke kontrole', async () => {
    const editor = name('Sestavovatel', 'Jan');
    editor['mods:role'] = [textRole('Sestavovatel, kompilátor')];

    const result = await parseModsAuthors(
      mods([editor]),
      'cs',
      { filterByRoles: true },
    );

    expect(result.iso).toBe('SESTAVOVATEL, Jan (sest.).');
    expect(result.diagnostics?.entries[0].roleCodes).toEqual(['com']);
    expect(result.diagnostics?.entries[0].roleSource).toBe('inferred');
    expect(result.diagnostics?.needsReview).toBe(true);
  });

  it('pbl a prt nikdy nevloží do autorské části', async () => {
    const result = await parseModsAuthors(
      mods([
        name('Nakladatel', '', ['pbl'], 'corporate'),
        name('Tiskař', '', ['prt'], 'corporate'),
      ]),
      'cs',
      { filterByRoles: true },
    );

    expect(result.iso).toBe('');
    expect(result.secondary?.iso).toBe('');
    expect(result.imprintPublishers).toEqual(['Nakladatel']);
    expect(result.diagnostics?.namesUsed).toBe(0);
    expect(result.diagnostics?.namesExcluded).toBe(2);
  });

  it('zachová všechny části corporate jména', async () => {
    const corporate = {
      $: { type: 'corporate', usage: 'primary' },
      'mods:namePart': [
        'Univerzita J.E. Purkyně v Ústí nad Labem',
        'Přírodovědecká fakulta.',
        'Katedra matematiky',
      ],
      'mods:role': [role('aut')],
    };

    const result = await parseModsAuthors(
      mods([corporate]),
      'cs',
      { filterByRoles: true },
    );

    expect(result.iso).toBe(
      'Univerzita J.E. Purkyně v Ústí nad Labem. Přírodovědecká fakulta. Katedra matematiky.',
    );
    expect(result.bibtex).toBe(
      '{Univerzita J.E. Purkyně v Ústí nad Labem. Přírodovědecká fakulta. Katedra matematiky}',
    );
  });

  it('zpracuje role i v MODS bez namespace prefixu', async () => {
    const unprefixedMods = {
      modsCollection: {
        mods: [
          {
            name: [
              {
                $: { type: 'personal' },
                namePart: [
                  { $: { type: 'family' }, _: 'Novák' },
                  { $: { type: 'given' }, _: 'Jan' },
                ],
                role: [
                  {
                    roleTerm: [
                      {
                        $: { authority: 'marcrelator', type: 'code' },
                        _: 'aut',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    };

    const result = await parseModsAuthors(
      unprefixedMods,
      'cs',
      { filterByRoles: true },
    );

    expect(result.iso).toBe('NOVÁK, Jan.');
  });
});
