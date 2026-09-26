/*
  Controlled lists. The content schema, nav, filters and pills all read from here.
  Adding a domain, game, kind or doc type starts in this file.
*/

// Domains: top-level groupings, shown in the nav when they have entries.
export const domains = {
  games: { label: 'Games', colour: 'var(--brand)' },
} as const;
export type Domain = keyof typeof domains;

// Games: a filter within the Games domain.
export const games = {
  'fallout-4': { label: 'Fallout 4', colour: 'var(--cat-gold)' },
  terraria: { label: 'Terraria', colour: 'var(--cat-blue)' },
  oni: { label: 'Oxygen Not Included', colour: 'var(--cat-orange)' },
} as const;
export type Game = keyof typeof games;

// Kinds: what sort of project it is, per domain.
export const kinds = {
  games: {
    mod: 'Mod',
    adventure: 'Adventure',
    map: 'Map',
  },
} as const;

// Status: where a project is in its life.
export const statuses = {
  active: { label: 'Active', colour: 'var(--status-active)' },
  released: { label: 'Released', colour: 'var(--status-released)' },
  resting: { label: 'Resting', colour: 'var(--status-resting)' },
  shelved: { label: 'Shelved', colour: 'var(--status-shelved)' },
} as const;
export type Status = keyof typeof statuses;

// Doc types: shared across every domain.
export const docTypes = {
  premise: 'Premise',
  design: 'Design',
  concept: 'Concept',
  assets: 'Assets',
  palette: 'Palette',
  guide: 'Guide',
  log: 'Log',
} as const;
export type DocType = keyof typeof docTypes;

// Link types: each gets a consistent icon.
export const linkTypes = {
  download: 'Download',
  repo: 'Source',
  video: 'Video',
  reference: 'Reference',
} as const;

// Helper: turn an object's keys into a tuple for z.enum().
export const keysOf = <T extends Record<string, unknown>>(obj: T) =>
  Object.keys(obj) as [keyof T & string, ...(keyof T & string)[]];
