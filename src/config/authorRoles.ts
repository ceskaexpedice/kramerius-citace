export type CreatorSlot = 'primary' | 'editor' | 'contributor' | 'imprint' | 'excluded';

export interface AuthorRoleRule {
  slot: CreatorSlot;
  review?: boolean;
}

/**
 * MARC relator registry used by role-aware citations.
 *
 * Roles whose primary status depends on the document model are registered as
 * contributors here and promoted by PRIMARY_ROLES_BY_MODEL below.
 */
export const AUTHOR_ROLE_RULES: Readonly<Record<string, AuthorRoleRule>> = {
  aut: { slot: 'primary' },
  cre: { slot: 'primary' },

  edt: { slot: 'editor' },
  com: { slot: 'editor' },
  orm: { slot: 'editor' },
  drt: { slot: 'editor' },

  cmp: { slot: 'contributor' },
  art: { slot: 'contributor' },
  ctg: { slot: 'contributor' },
  lbt: { slot: 'contributor' },
  ive: { slot: 'contributor' },
  trl: { slot: 'contributor' },
  ill: { slot: 'contributor' },
  aui: { slot: 'contributor' },
  aft: { slot: 'contributor' },
  cwt: { slot: 'contributor' },
  adp: { slot: 'contributor' },
  pht: { slot: 'contributor' },
  scr: { slot: 'contributor' },
  sce: { slot: 'contributor' },
  clb: { slot: 'contributor' },
  ant: { slot: 'contributor', review: true },
  ivr: { slot: 'contributor' },
  oth: { slot: 'excluded', review: true },

  pbl: { slot: 'imprint' },
  prt: { slot: 'imprint' },
  prm: { slot: 'imprint' },
  pop: { slot: 'imprint' },

  own: { slot: 'excluded' },
  rcp: { slot: 'excluded' },
  crp: { slot: 'excluded' },
  bkd: { slot: 'excluded' },
  bjd: { slot: 'excluded' },
  org: { slot: 'excluded', review: true },
};

export const PRIMARY_ROLES_BY_MODEL: Readonly<Record<string, ReadonlySet<string>>> = {
  sheetmusic: new Set(['cmp', 'lbt']),
  graphic: new Set(['art']),
  map: new Set(['art', 'ctg']),
};

export const CZECH_ROLE_LABELS: Readonly<Record<string, string>> = {
  autor: 'aut',
  'nakladatel vydavatel': 'pbl',
  'sestavovatel kompilator': 'com',
  reziser: 'drt',
  tiskar: 'prt',
  umelec: 'art',
  libretista: 'lbt',
  skladatel: 'cmp',
  'jina role': 'oth',
};

export const AUTHOR_ROLE_WHITELIST: ReadonlySet<string> = new Set(
  Object.entries(AUTHOR_ROLE_RULES)
    .filter(([, rule]) => ['primary', 'editor', 'contributor'].includes(rule.slot))
    .map(([code]) => code),
);

export const AUTHOR_ROLE_BLACKLIST: ReadonlySet<string> = new Set(
  Object.entries(AUTHOR_ROLE_RULES)
    .filter(([, rule]) => ['imprint', 'excluded'].includes(rule.slot))
    .map(([code]) => code),
);

export const ROLE_LABELS: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  cs: {
    edt: 'Editoval',
    com: 'Sestavil',
    orm: 'Organizoval',
    drt: 'Režíroval',
    cmp: 'Složil',
    art: 'Výtvarné zpracování',
    ctg: 'Kartografie',
    lbt: 'Libreto',
    ive: 'Zpovídaný',
    trl: 'Přeložil',
    ill: 'Ilustroval',
    aui: 'Úvod',
    aft: 'Doslov',
    cwt: 'Komentář',
    adp: 'Adaptoval',
    pht: 'Fotografie',
    scr: 'Písař',
    sce: 'Scénář',
    clb: 'Spolupráce',
    ivr: 'Rozhovor vedl',
    ant: 'Příspěvek',
    oth: 'Příspěvek',
  },
  en: {
    edt: 'edited by',
    com: 'compiled by',
    orm: 'organized by',
    drt: 'directed by',
    cmp: 'composed by',
    art: 'art by',
    ctg: 'cartography by',
    lbt: 'libretto by',
    ive: 'interviewee',
    trl: 'translated by',
    ill: 'illustrated by',
    aui: 'introduction by',
    aft: 'afterword by',
    cwt: 'commentary by',
    adp: 'adapted by',
    pht: 'photographs by',
    scr: 'written by',
    sce: 'screenplay by',
    clb: 'with contributions by',
    ivr: 'interviewed by',
    ant: 'contributions by',
    oth: 'contributions by',
  },
};

/**
 * Noun forms used in the ISO 690 responsibility statement after a creator's
 * name. Other exports retain their format-specific wording from ROLE_LABELS.
 */
export const ISO_ROLE_LABELS: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  cs: {
    edt: 'ed.',
    com: 'sest.',
    orm: 'organizátor',
    drt: 'režisér',
    cmp: 'skladatel',
    art: 'výtvarník',
    ctg: 'kartograf',
    lbt: 'libretista',
    ive: 'zpovídaný',
    trl: 'překl.',
    ill: 'il.',
    aui: 'autor úvodu',
    aft: 'autor doslovu',
    cwt: 'autor komentáře',
    adp: 'adaptátor',
    pht: 'fotograf',
    scr: 'písař',
    sce: 'scenárista',
    clb: 'spolupracovník',
    ivr: 'tazatel',
    ant: 'autor příspěvku',
    oth: 'přispěvatel',
  },
  en: {
    edt: 'editor',
    com: 'compiler',
    orm: 'organizer',
    drt: 'director',
    cmp: 'composer',
    art: 'artist',
    ctg: 'cartographer',
    lbt: 'librettist',
    ive: 'interviewee',
    trl: 'translator',
    ill: 'illustrator',
    aui: 'author of introduction',
    aft: 'author of afterword',
    cwt: 'commentator',
    adp: 'adapter',
    pht: 'photographer',
    scr: 'scribe',
    sce: 'screenwriter',
    clb: 'collaborator',
    ivr: 'interviewer',
    ant: 'contributor',
    oth: 'contributor',
  },
};
