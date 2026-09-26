/*
  Controlled lists. The content schema, nav, filters and pills all read from here.
  Adding a domain, game, kind or doc type starts in this file.
*/

// Games: existing games you make content for. The category filter within the Games domain.
export const games = {
  'fallout-4': { label: 'Fallout 4', colour: 'var(--cat-gold)' },
  terraria: { label: 'Terraria', colour: 'var(--cat-blue)' },
  oni: { label: 'Oxygen Not Included', colour: 'var(--cat-orange)' },
} as const;
export type Game = keyof typeof games;

// Domains: top-level groupings, shown in the nav when they have entries.
//   games:   content for existing games (mods, maps, adventures)
//   builds:  things built from scratch (apps, own games, tools)
//   digital: information pieces and experience design, including this site
// `category` is an optional extra filter a domain can have, like Game for Games.
type Category = {
  key: string;
  label: string;
  options: Record<string, { label: string; colour: string }>;
};
type DomainConfig = { label: string; colour: string; category?: Category };

export const domains: Record<'games' | 'builds' | 'digital', DomainConfig> = {
  games: {
    label: 'Games',
    colour: 'var(--brand)',
    category: { key: 'game', label: 'Game', options: games },
  },
  builds: {
    label: 'Builds',
    colour: 'var(--cat-coral)',
  },
  digital: {
    label: 'Digital',
    colour: 'var(--cat-cyan)',
  },
};
export type Domain = keyof typeof domains;

// Kinds: what sort of project it is, per domain.
export const kinds = {
  games: {
    mod: 'Mod',
    adventure: 'Adventure',
    map: 'Map',
  },
  builds: {
    app: 'App',
    game: 'Game',
    tool: 'Tool',
    prototype: 'Prototype',
  },
  digital: {
    site: 'Site',
    tool: 'Tool',
    experiment: 'Experiment',
  },
} as const;

// Status: where a project is in its life. Separate from `draft`, which is about the write-up.
export const statuses = {
  concept: { label: 'Concept', colour: 'var(--status-concept)' },
  planning: { label: 'Planning', colour: 'var(--status-planning)' },
  development: { label: 'In development', colour: 'var(--status-development)' },
  maintained: { label: 'Maintained', colour: 'var(--status-maintained)' },
  unmaintained: { label: 'Unmaintained', colour: 'var(--status-unmaintained)' },
  paused: { label: 'Paused', colour: 'var(--status-paused)' },
  discontinued: { label: 'Discontinued', colour: 'var(--status-discontinued)' },
} as const;
export type Status = keyof typeof statuses;

// Statuses that mean the project has been released.
export const releasedStatuses: Status[] = ['maintained', 'unmaintained'];

// Doc types: shared across every domain.
export const docTypes = {
  premise: 'Premise',
  gallery: 'Gallery',
  design: 'Design',
  concept: 'Concept',
  assets: 'Assets',
  palette: 'Palette',
  guide: 'Guide',
  log: 'Log',
} as const;
export type DocType = keyof typeof docTypes;

// AI usage: how much AI was involved in making the project.
export const aiLevels = {
  none: { label: 'None', description: 'No AI used.' },
  assisted: { label: 'Assisted', description: 'AI helped with parts, such as troubleshooting or drafts.' },
  'co-built': { label: 'Co-built', description: 'AI produced significant parts, directed and reviewed by me.' },
  generated: { label: 'Generated', description: 'Mostly produced by AI.' },
} as const;
export type AiLevel = keyof typeof aiLevels;

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
