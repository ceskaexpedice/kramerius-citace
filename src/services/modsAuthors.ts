import { getLocale } from '../locales';
import {
  AUTHOR_ROLE_RULES,
  CZECH_ROLE_LABELS,
  CreatorSlot,
  ISO_ROLE_LABELS,
  PRIMARY_ROLES_BY_MODEL,
  ROLE_LABELS,
} from '../config/authorRoles';

export interface ParseModsAuthorsOptions {
  filterByRoles?: boolean;
  model?: string;
  genre?: string | string[];
  isoMaxNames?: number;
  isoEtAl?: string;
}

export type CreatorConfidence = 'certain' | 'inferred' | 'unknown';
export type CreatorRoleSource = 'code' | 'text' | 'inferred' | 'none';

export interface CreatorEntry {
  nameType: 'personal' | 'corporate' | 'conference';
  position: number;
  usagePrimary: boolean;
  family: string;
  given: string;
  suffix: string;
  lifeDates: string;
  displayName: string;
  subordinateUnits: string[];
  roleCodes: string[];
  roleLabels: string[];
  roleSource: CreatorRoleSource;
  slot: CreatorSlot;
  label: string;
  confidence: CreatorConfidence;
  reviewFlag: boolean;
  inferenceRule?: 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6';
}

export interface DroppedCreator {
  displayName: string;
  position: number;
  reason: 'R3';
}

interface ParsedAuthors {
  iso: string;
  mla: string;
  bibtex: string;
  wiki: string;
  ris: string;
  bibtexFields?: string;
  secondary?: {
    iso: string;
    mla: string;
  };
  imprintPublishers?: string[];
  entries?: CreatorEntry[];
  diagnostics?: {
    citationConfidence: CreatorConfidence;
    needsReview: boolean;
    namesUsed: number;
    namesExcluded: number;
    dropped: DroppedCreator[];
    entries: CreatorEntry[];
  };
}

function getModsElement(node: any, name: string): any {
  return node?.[`mods:${name}`] ?? node?.[name];
}

function getModsRecord(mods: any): any {
  const collection = getModsElement(mods, 'modsCollection');
  return getModsElement(collection, 'mods')?.[0];
}

function valueOf(node: any): string {
  if (typeof node === 'string') return node.trim();
  return typeof node?._ === 'string' ? node._.trim() : '';
}

function normalizeRoleCode(value: string): string {
  return value.trim().toLowerCase().replace(/\.+$/, '');
}

function normalizeLookup(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizeNameKey(value: string): string {
  return normalizeLookup(value.split('|')[0]).replace(/[^a-z0-9]/g, '');
}

function cleanCorporatePart(value: string): string {
  return value.trim().replace(/[.,;:\s]+$/, '');
}

function parseNameParts(name: any, position: number): CreatorEntry | null {
  const nameParts = getModsElement(name, 'namePart');
  if (!Array.isArray(nameParts)) return null;

  const rawType = String(name.$?.type || 'personal').toLowerCase();
  const nameType: CreatorEntry['nameType'] =
    rawType === 'corporate' || rawType === 'conference' ? rawType : 'personal';

  let family = '';
  let given = '';
  let suffix = '';
  let lifeDates = '';
  const untypedParts: string[] = [];

  for (const part of nameParts) {
    const value = valueOf(part);
    if (!value) continue;
    const type = typeof part === 'string' ? '' : String(part.$?.type || '').toLowerCase();

    if (nameType !== 'personal') {
      if (type === 'date') lifeDates = value;
      else untypedParts.push(value);
    } else if (type === 'family') family = value;
    else if (type === 'given') given = value;
    else if (type === 'termsofaddress') suffix = value;
    else if (type === 'date') lifeDates = value;
    else untypedParts.push(value);
  }

  let displayName = '';
  let subordinateUnits: string[] = [];
  let reviewFlag = false;

  if (nameType === 'corporate') {
    subordinateUnits = untypedParts
      .flatMap((part) => part.split('|'))
      .map(cleanCorporatePart)
      .filter(Boolean);
    displayName = subordinateUnits.join('. ');
    family = displayName;
    given = '';
  } else if (nameType === 'conference') {
    displayName = untypedParts.join(' | ').trim() || [family, given].filter(Boolean).join(', ');
    family = displayName;
    given = '';
  } else {
    const transcribed = untypedParts.join(' | ').split('|')[0].trim();
    if ((!family || !given) && transcribed) {
      const comma = transcribed.indexOf(',');
      if (comma >= 0) {
        family ||= transcribed.slice(0, comma).trim().replace(/,+$/, '');
        given ||= transcribed.slice(comma + 1).trim().replace(/^,+|,+$/g, '');
      } else {
        family ||= transcribed.replace(/,+$/, '');
        reviewFlag = true;
      }
    }
    displayName = [family, given].filter(Boolean).join(', ');
    if (suffix) displayName += `${displayName ? ', ' : ''}${suffix}`;
  }

  if (!displayName) return null;

  const roles = extractRoles(name);
  return {
    nameType,
    position,
    usagePrimary: String(name.$?.usage || '').toLowerCase() === 'primary',
    family,
    given,
    suffix,
    lifeDates,
    displayName,
    subordinateUnits,
    roleCodes: roles.codes,
    roleLabels: roles.labels,
    roleSource: roles.source,
    slot: 'contributor',
    label: '',
    confidence: roles.codes.length ? 'certain' : 'unknown',
    reviewFlag: reviewFlag || roles.review,
  };
}

function extractRoles(name: any): {
  codes: string[];
  labels: string[];
  source: CreatorRoleSource;
  review: boolean;
} {
  const roles = getModsElement(name, 'role');
  if (!Array.isArray(roles)) {
    return { codes: [], labels: [], source: 'none', review: false };
  }

  const codes: string[] = [];
  const labels: string[] = [];
  let review = false;

  for (const role of roles) {
    const terms = getModsElement(role, 'roleTerm');
    if (!Array.isArray(terms)) continue;

    for (const term of terms) {
      const value = valueOf(term);
      if (!value) continue;
      const type = typeof term === 'string' ? '' : String(term.$?.type || '').toLowerCase();
      const authority = typeof term === 'string' ? '' : String(term.$?.authority || '').toLowerCase();
      const looksLikeCode = /^[a-z]{3}\.?$/i.test(value);

      if (type === 'code' || (!type && looksLikeCode)) {
        codes.push(normalizeRoleCode(value));
        if (authority !== 'marcrelator') review = true;
      } else {
        labels.push(value);
      }
    }
  }

  if (codes.length > 0) {
    return { codes: [...new Set(codes)], labels, source: 'code', review };
  }

  const inferredCodes = labels
    .map((label) => CZECH_ROLE_LABELS[normalizeLookup(label)])
    .filter((code): code is string => Boolean(code));

  if (inferredCodes.length > 0) {
    return {
      codes: [...new Set(inferredCodes)],
      labels,
      source: 'inferred',
      review: true,
    };
  }

  return {
    codes: [],
    labels,
    source: labels.length ? 'text' : 'none',
    review: labels.length > 0,
  };
}

const SLOT_PRIORITY: Readonly<Record<CreatorSlot, number>> = {
  primary: 5,
  editor: 4,
  contributor: 3,
  imprint: 2,
  excluded: 1,
};

function roleSlot(
  code: string,
  model = '',
  genres: string[] = [],
): { slot: CreatorSlot; review: boolean } {
  const genreMakesPrimary =
    (code === 'ive' && genres.some((genre) => /interview|rozhovor/.test(genre)))
    || (code === 'cmp' && genres.some((genre) => /music|hudeb/.test(genre)))
    || (code === 'lbt' && genres.some((genre) => /libret|opera|hudeb/.test(genre)))
    || (code === 'ctg' && genres.some((genre) => /map|kartograf/.test(genre)))
    || (code === 'art' && genres.some((genre) => /graphic|grafik|map/.test(genre)));

  if (PRIMARY_ROLES_BY_MODEL[model]?.has(code) || genreMakesPrimary) {
    return { slot: 'primary', review: false };
  }

  const rule = AUTHOR_ROLE_RULES[code];
  if (rule) return { slot: rule.slot, review: Boolean(rule.review) };
  return { slot: 'excluded', review: true };
}

function chooseExplicitSlot(entry: CreatorEntry, model: string, genres: string[]): void {
  const decisions = entry.roleCodes.map((code) => ({
    code,
    ...roleSlot(code, model, genres),
  }));
  const selected = decisions.sort((a, b) => SLOT_PRIORITY[b.slot] - SLOT_PRIORITY[a.slot])[0];
  if (!selected) return;

  entry.slot = selected.slot;
  entry.label = selected.code;
  entry.confidence = AUTHOR_ROLE_RULES[selected.code] ? 'certain' : 'inferred';
  entry.reviewFlag ||= selected.review;
}

function deduplicate(entries: CreatorEntry[]): { entries: CreatorEntry[]; dropped: DroppedCreator[] } {
  const byKey = new Map<string, CreatorEntry>();
  const dropped: DroppedCreator[] = [];

  for (const entry of entries) {
    const key = normalizeNameKey(entry.displayName);
    if (!key || !byKey.has(key)) {
      byKey.set(key || `position-${entry.position}`, entry);
      continue;
    }

    const existing = byKey.get(key)!;
    const existingScore = (existing.roleCodes.length ? 2 : 0) + (existing.usagePrimary ? 1 : 0);
    const newScore = (entry.roleCodes.length ? 2 : 0) + (entry.usagePrimary ? 1 : 0);

    if (newScore > existingScore) {
      dropped.push({ displayName: existing.displayName, position: existing.position, reason: 'R3' });
      byKey.set(key, entry);
    } else {
      dropped.push({ displayName: entry.displayName, position: entry.position, reason: 'R3' });
    }
  }

  return {
    entries: [...byKey.values()].sort((a, b) => a.position - b.position),
    dropped,
  };
}

function inferMissingRoles(entries: CreatorEntry[], model: string, genres: string[]): void {
  for (const entry of entries.filter((item) => item.nameType === 'conference')) {
    entry.slot = 'excluded';
    entry.confidence = entry.roleCodes.length > 0 ? 'certain' : 'unknown';
  }

  for (const entry of entries.filter(
    (item) => item.nameType === 'corporate' && item.roleCodes.length === 0,
  )) {
    entry.slot = 'excluded';
    entry.confidence = 'unknown';
    entry.reviewFlag = true;
  }

  for (const entry of entries.filter(
    (item) => item.nameType !== 'conference' && item.roleCodes.length > 0,
  )) {
    chooseExplicitSlot(entry, model, genres);
  }

  const missing = entries.filter(
    (entry) => entry.nameType === 'personal' && entry.roleCodes.length === 0,
  );
  for (const entry of missing.filter((item) => item.usagePrimary)) {
    entry.slot = 'primary';
    if (entry.roleSource === 'none') entry.roleSource = 'inferred';
    entry.confidence = 'inferred';
    entry.inferenceRule = 'R1';
  }

  if (entries.length === 1 && missing.length === 1 && !missing[0].inferenceRule) {
    missing[0].slot = 'primary';
    if (missing[0].roleSource === 'none') missing[0].roleSource = 'inferred';
    missing[0].confidence = 'inferred';
    missing[0].inferenceRule = 'R2';
  }

  const unresolved = () => missing.filter((entry) => !entry.inferenceRule);
  const nobodyHasRole = entries.every((entry) => entry.roleCodes.length === 0);

  if (nobodyHasRole && unresolved().length > 0) {
    const primary =
      unresolved().find((entry) => entry.nameType === 'personal')
      || unresolved()[0];
    primary.slot = 'primary';
    if (primary.roleSource === 'none') primary.roleSource = 'inferred';
    primary.confidence = 'unknown';
    primary.reviewFlag = true;
    primary.inferenceRule = 'R5';

    for (const entry of unresolved()) {
      entry.slot = 'excluded';
      if (entry.roleSource === 'none') entry.roleSource = 'inferred';
      entry.confidence = 'unknown';
      entry.reviewFlag = true;
      entry.inferenceRule = 'R5';
    }
    return;
  }

  const hasPrimary = () => entries.some((entry) => entry.slot === 'primary');
  for (const entry of unresolved().filter((item) => item.nameType === 'personal')) {
    if (!hasPrimary()) {
      entry.slot = 'primary';
      entry.inferenceRule = 'R5';
    } else {
      entry.slot = 'excluded';
      entry.inferenceRule = 'R4';
    }
    if (entry.roleSource === 'none') entry.roleSource = 'inferred';
    entry.confidence = 'unknown';
    entry.reviewFlag = true;
  }

  for (const entry of unresolved()) {
    const personalPrimary = entries.some(
      (item) => item.nameType === 'personal' && item.slot === 'primary',
    );
    entry.slot = personalPrimary || hasPrimary() ? 'contributor' : 'primary';
    if (entry.roleSource === 'none') entry.roleSource = 'inferred';
    entry.confidence = 'unknown';
    entry.reviewFlag = true;
    entry.inferenceRule = 'R6';
  }
}

function naturalName(entry: CreatorEntry): string {
  if (entry.nameType !== 'personal') return entry.displayName;
  return [entry.given, entry.family, entry.suffix].filter(Boolean).join(' ') || entry.displayName;
}

function invertedName(entry: CreatorEntry, uppercaseFamily = false): string {
  if (entry.nameType !== 'personal') return entry.displayName;
  const family = uppercaseFamily ? entry.family.toUpperCase() : entry.family;
  return [family, entry.given, entry.suffix].filter(Boolean).join(', ');
}

function joinNames(values: string[], conjunction: string): string {
  if (values.length <= 1) return values[0] || '';
  return `${values.slice(0, -1).join('; ')} ${conjunction} ${values[values.length - 1]}`;
}

function formatIsoNames(
  entries: CreatorEntry[],
  conjunction: string,
  maxNames: number,
  etAl: string,
  roleLang?: string,
): string {
  const displayed = entries.slice(0, maxNames).map((entry) => {
    const name = invertedName(entry, true);
    return roleLang
      ? `${name} (${isoContributionLabels(entry, roleLang).join(', ')})`
      : name;
  });
  const joined = joinNames(displayed, conjunction);
  return entries.length > maxNames ? `${joined} ${etAl}` : joined;
}

function formatMlaNames(entries: CreatorEntry[]): string {
  if (entries.length === 0) return '';
  if (entries.length === 1) return invertedName(entries[0]);
  if (entries.length === 2) {
    return `${invertedName(entries[0])}, and ${naturalName(entries[1])}`;
  }
  return `${invertedName(entries[0])}, et al.`;
}

function formatBibtexName(entry: CreatorEntry): string {
  if (entry.nameType !== 'personal') return `{${entry.displayName}}`;
  return entry.given ? `{${entry.family}}, ${entry.given}` : `{${entry.family}}`;
}

function contributionRoleCodes(entry: CreatorEntry): string[] {
  const codes = entry.roleCodes.filter((code) => {
    const slot = AUTHOR_ROLE_RULES[code]?.slot;
    return slot === 'contributor' || !slot;
  });
  return [...new Set([entry.label, ...codes].filter(Boolean))];
}

function contributionLabels(entry: CreatorEntry, lang: string): string[] {
  const labels = ROLE_LABELS[lang] || ROLE_LABELS.en;
  const values = contributionRoleCodes(entry)
    .map((code) => labels[code])
    .filter(Boolean);
  return values.length > 0
    ? [...new Set(values)]
    : [lang === 'cs' ? 'Příspěvek' : 'contributions by'];
}

function isoContributionLabels(entry: CreatorEntry, lang: string): string[] {
  const labels = ISO_ROLE_LABELS[lang] || ISO_ROLE_LABELS.en;
  const values = contributionRoleCodes(entry)
    .map((code) => labels[code])
    .filter(Boolean);
  return values.length > 0
    ? [...new Set(values)]
    : [lang === 'cs' ? 'přispěvatel' : 'contributor'];
}

function isoSecondaryName(entry: CreatorEntry): string {
  if (entry.nameType !== 'personal') return entry.displayName;
  return [entry.given, entry.family.toUpperCase(), entry.suffix]
    .filter(Boolean)
    .join(' ') || entry.displayName;
}

function formatSecondary(entries: CreatorEntry[], lang: string): { iso: string; mla: string } {
  const isoFragments = entries.map((entry) => {
    const label = isoContributionLabels(entry, lang).join(', ');
    return `${isoSecondaryName(entry)} (${label}).`;
  });
  const mlaFragments = entries.map(
    (entry) => `${contributionLabels(entry, 'en').join(', ')} ${naturalName(entry)}.`,
  );
  return {
    iso: isoFragments.join(' '),
    mla: mlaFragments.join(' '),
  };
}

function formatWiki(entries: CreatorEntry[], secondary: CreatorEntry[], locale: any): string {
  let wiki = '';
  entries.forEach((entry, index) => {
    const number = index + 1;
    if (entry.nameType === 'personal') {
      const suffix = number === 1 ? '' : number;
      wiki += `${locale.wiki.surname}${suffix} = ${entry.family} | `;
      if (entry.given) wiki += `${locale.wiki.name}${suffix} = ${entry.given} | `;
    } else {
      wiki += `author${number} = ${entry.displayName} | `;
    }
  });

  const editors = secondary.filter((entry) => entry.slot === 'editor');
  editors.forEach((entry, index) => {
    const number = index + 1;
    if (entry.nameType === 'personal') {
      wiki += `editor-last${number} = ${entry.family} | `;
      if (entry.given) wiki += `editor-first${number} = ${entry.given} | `;
    } else {
      wiki += `editor${number} = ${entry.displayName} | `;
    }
  });

  const contributors = secondary.filter((entry) => entry.slot === 'contributor');
  const translators = contributors.filter((entry) => entry.roleCodes.includes('trl'));
  translators.forEach((entry, index) => {
    const number = index + 1;
    if (entry.nameType === 'personal') {
      wiki += `translator-last${number} = ${entry.family} | `;
      if (entry.given) wiki += `translator-first${number} = ${entry.given} | `;
    } else {
      wiki += `translator${number} = ${entry.displayName} | `;
    }
  });

  const otherContributions = contributors.flatMap((entry) => {
    const codes = contributionRoleCodes(entry).filter((code) => code !== 'trl');
    if (codes.length === 0 && entry.roleCodes.includes('trl')) return [];
    const effectiveCodes = codes.length > 0 ? codes : [''];
    return effectiveCodes.map((code) => {
      const label = code
        ? (ROLE_LABELS.cs[code] || 'Příspěvek')
        : 'Příspěvek';
      return `${label}: ${naturalName(entry)}`;
    });
  });
  if (otherContributions.length > 0) {
    const others = otherContributions.join('; ');
    wiki += `others = ${others} | `;
  }
  return wiki;
}

function emptyAuthors(): ParsedAuthors {
  return { iso: '', mla: '', bibtex: '', wiki: '', ris: '' };
}

function formatRoleAwareAuthors(
  entries: CreatorEntry[],
  dropped: DroppedCreator[],
  lang: string,
  options: ParseModsAuthorsOptions,
): ParsedAuthors {
  const locale = getLocale(lang);
  const primary = entries.filter((entry) => entry.slot === 'primary');
  const editors = entries.filter((entry) => entry.slot === 'editor');
  const contributors = entries.filter((entry) => entry.slot === 'contributor');
  const lead = primary.length > 0 ? primary : editors;
  const secondary = primary.length > 0 ? [...editors, ...contributors] : contributors;
  const maxNames = options.isoMaxNames ?? 3;
  const etAl = options.isoEtAl ?? (lang === 'cs' ? 'aj.' : 'et al.');

  let iso = formatIsoNames(
    lead,
    locale.and,
    maxNames,
    etAl,
    primary.length === 0 ? lang : undefined,
  );
  let mla = formatMlaNames(lead);
  if (primary.length === 0 && editors.length > 0) {
    mla += `, ${editors.length > 1 ? 'editors' : 'editor'}`;
  }
  if (iso) iso += '.';
  if (mla) mla += '.';

  const bibtexAuthor = primary.map(formatBibtexName).join(' and ');
  const bibtexEditor = editors.map(formatBibtexName).join(' and ');
  const translator = contributors
    .filter((entry) => entry.roleCodes.includes('trl'))
    .map(formatBibtexName)
    .join(' and ');
  const notes = contributors
    .flatMap((entry) => {
      const codes = contributionRoleCodes(entry).filter((code) => code !== 'trl');
      if (codes.length === 0 && entry.roleCodes.includes('trl')) return [];
      const effectiveCodes = codes.length > 0 ? codes : [''];
      return effectiveCodes.map((code) => {
        const label = code ? (ROLE_LABELS.en[code] || 'contributions by') : 'contributions by';
        return `${label} ${naturalName(entry)}`;
      });
    })
    .join('; ');

  let bibtexFields = '';
  if (bibtexAuthor) bibtexFields += `author = {${bibtexAuthor}}, `;
  if (bibtexEditor) bibtexFields += `editor = {${bibtexEditor}}, `;
  if (translator) bibtexFields += `translator = {${translator}}, `;
  if (notes) bibtexFields += `note = {${notes}}, `;

  let ris = '';
  primary.forEach((entry) => { ris += `AU  - ${invertedName(entry)}\n`; });
  editors.forEach((entry) => { ris += `A2  - ${invertedName(entry)}\n`; });
  contributors.forEach((entry) => {
    ris += `A3  - ${invertedName(entry)}\n`;
    ris += `N1  - Role: ${entry.roleCodes.join(', ') || 'unknown'} — ${invertedName(entry)}\n`;
  });

  const used = [...primary, ...editors, ...contributors];
  const needsReview = entries.some((entry) => entry.reviewFlag);
  if (needsReview) bibtexFields += 'keywords = {needs-review}, ';
  const confidenceRank: Readonly<Record<CreatorConfidence, number>> = {
    certain: 3,
    inferred: 2,
    unknown: 1,
  };
  const citationConfidence = used.reduce<CreatorConfidence>(
    (lowest, entry) =>
      confidenceRank[entry.confidence] < confidenceRank[lowest] ? entry.confidence : lowest,
    'certain',
  );

  return {
    iso,
    mla,
    bibtex: bibtexAuthor,
    bibtexFields,
    wiki: formatWiki(primary, [...editors, ...contributors], locale),
    ris,
    secondary: formatSecondary(secondary, lang),
    imprintPublishers: entries
      .filter((entry) => entry.slot === 'imprint' && entry.roleCodes.includes('pbl'))
      .map((entry) => entry.displayName),
    entries,
    diagnostics: {
      citationConfidence,
      needsReview,
      namesUsed: used.length,
      namesExcluded: entries.length - used.length,
      dropped,
      entries,
    },
  };
}

function parseLegacyAuthors(names: any[], lang: string): ParsedAuthors {
  const locale = getLocale(lang);
  const authorsList: string[] = [];
  const authorsListIso: string[] = [];
  let wikiAuthors = '';
  let risAuthors = '';
  let i = 1;

  names.forEach((name: any) => {
    if (name.$?.nameTitleGroup) return;
    const nameType = name.$?.type;
    if (String(nameType || '').toLowerCase() === 'conference') return;
    const namePart = getModsElement(name, 'namePart');
    if (!Array.isArray(namePart)) return;
    let family = '';
    let given = '';

    namePart.forEach((part: any) => {
      if (typeof part === 'string') {
        family = part.split(', ')[0];
        given = part.split(', ')[1];
      }
      if (part.$?.type === 'family' && part._) family = part._;
      if (part.$?.type === 'given' && part._) given = part._;
    });

    if (family && given) {
      authorsListIso.push(nameType !== 'corporate' ? `${family.toUpperCase()}, ${given}` : `${family}, ${given}`);
      authorsList.push(`${family}, ${given}`);
      risAuthors += `AU  - ${family}, ${given}\n`;
      const suffix = i === 1 ? '' : i;
      wikiAuthors += `${locale.wiki.surname}${suffix} = ${family} | ${locale.wiki.name}${suffix} = ${given} | `;
    } else if (family || given) {
      const value = family || given;
      authorsListIso.push(value);
      authorsList.push(value);
      risAuthors += `AU  - ${value}\n`;
      const suffix = i === 1 ? '' : i;
      wikiAuthors += `${locale.wiki.surname}${suffix} = ${value} | `;
    }
    i += 1;
  });

  if (authorsList.length === 0) return emptyAuthors();
  if (authorsList.length === 1) {
    return {
      iso: `${authorsListIso[0]}.`,
      mla: `${authorsList[0]}.`,
      bibtex: authorsList[0],
      wiki: wikiAuthors,
      ris: risAuthors,
    };
  }
  if (authorsList.length === 2) {
    return {
      iso: `${authorsListIso[0]} ${locale.and} ${authorsListIso[1]}.`,
      mla: `${authorsList[0]} ${locale.and} ${authorsList[1]}.`,
      bibtex: authorsList.join(' and '),
      wiki: wikiAuthors,
      ris: risAuthors,
    };
  }
  if (authorsList.length <= 4) {
    return {
      iso: `${authorsListIso.slice(0, -1).join('; ')} ${locale.and} ${authorsListIso[authorsList.length - 1]}.`,
      mla: `${authorsList[0]}, et al.`,
      bibtex: authorsList.join(' and '),
      wiki: wikiAuthors,
      ris: risAuthors,
    };
  }
  return {
    iso: `${authorsListIso[0]} et al.`,
    mla: `${authorsList[0]}, et al.`,
    bibtex: `${authorsList[0]} and others`,
    wiki: wikiAuthors,
    ris: risAuthors,
  };
}

export async function parseModsAuthors(
  mods: any,
  lang: string,
  options: ParseModsAuthorsOptions = {},
): Promise<ParsedAuthors> {
  const names = getModsElement(getModsRecord(mods), 'name');
  if (!Array.isArray(names)) return emptyAuthors();
  if (!options.filterByRoles) return parseLegacyAuthors(names, lang);

  const parsed = names
    .map((name: any, position: number) =>
      name.$?.nameTitleGroup ? null : parseNameParts(name, position))
    .filter((entry): entry is CreatorEntry => Boolean(entry));
  const deduplicated = deduplicate(parsed);
  const optionGenres = Array.isArray(options.genre)
    ? options.genre
    : options.genre
      ? [options.genre]
      : [];
  const modsGenres = (getModsElement(getModsRecord(mods), 'genre') || [])
    .map(valueOf)
    .filter(Boolean);
  const genres = [...optionGenres, ...modsGenres].map(normalizeLookup);
  inferMissingRoles(deduplicated.entries, options.model || '', genres);
  return formatRoleAwareAuthors(deduplicated.entries, deduplicated.dropped, lang, options);
}
