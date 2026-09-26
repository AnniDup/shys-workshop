import { getCollection, type CollectionEntry } from 'astro:content';
import { sections, type PartSection, type Section } from '../config/taxonomy';
import { getDocs, getProjects, type Project } from './content';

export type Part = CollectionEntry<'parts'>;
export type Arc = CollectionEntry<'arcs'>;

const visible = (e: { data: { draft: boolean } }) => import.meta.env.DEV || !e.data.draft;

// Part ids look like "<project>/<section>/<slug>"; arc ids like "<project>/<slug>".
export const partProjectOf = (p: Part) => p.id.split('/')[0];
export const partSectionOf = (p: Part) => p.id.split('/')[1] as PartSection;
export const partSlugOf = (p: Part) => p.id.split('/')[2];
export const arcProjectOf = (a: Arc) => a.id.split('/')[0];
export const arcSlugOf = (a: Arc) => a.id.split('/')[1];

// Names that section folders use in URLs, so no doc may take them.
export const RESERVED = [...Object.keys(sections), 'changelog'];

export type Adventure = {
  arcs: Arc[];
  npcs: Part[];
  locations: Part[];
  items: Part[];
};

const byOrder = <T extends { data: { order: number; title: string } }>(a: T, b: T) =>
  a.data.order - b.data.order || a.data.title.localeCompare(b.data.title);

let checked: Promise<Map<string, Adventure>> | undefined;

// Loads every adventure's arcs and parts once, and checks all their links.
async function load(): Promise<Map<string, Adventure>> {
  const [projects, allProjects, parts, arcs, docs] = await Promise.all([
    getProjects(),
    getCollection('projects'),
    getCollection('parts', visible),
    getCollection('arcs', visible),
    getDocs(),
  ]);

  const problems: string[] = [];
  const domainOf = new Map(allProjects.map((p) => [p.id, p.data.domain]));

  // Sections belong to Tabletop projects only.
  for (const id of new Set([...parts.map(partProjectOf), ...arcs.map(arcProjectOf)])) {
    if (!domainOf.has(id)) problems.push(`"${id}" has arcs, npcs, locations or items but no index.md`);
    else if (domainOf.get(id) !== 'tabletop')
      problems.push(`"${id}" has arcs, npcs, locations or items, which only Tabletop projects can have`);
  }

  // Docs can't use a section's name, or their URLs would clash.
  for (const d of docs) {
    const slug = d.id.split('/')[1];
    if (RESERVED.includes(slug)) problems.push(`${d.id}: "${slug}" is reserved; rename the doc file`);
  }

  const map = new Map<string, Adventure>();
  for (const p of projects) {
    const mine = parts.filter((x) => partProjectOf(x) === p.id);
    map.set(p.id, {
      arcs: arcs.filter((a) => arcProjectOf(a) === p.id).sort(byOrder),
      npcs: mine.filter((x) => partSectionOf(x) === 'npcs').sort(byOrder),
      locations: mine.filter((x) => partSectionOf(x) === 'locations').sort(byOrder),
      items: mine.filter((x) => partSectionOf(x) === 'items').sort(byOrder),
    });
  }

  // Every NPC, location and item an arc lists must exist in the same adventure.
  const allParts = await getCollection('parts');
  const exists = new Set(allParts.map((x) => x.id));
  for (const a of arcs) {
    const project = arcProjectOf(a);
    for (const section of ['npcs', 'locations', 'items'] as const) {
      for (const slug of a.data[section]) {
        if (!exists.has(`${project}/${section}/${slug}`)) {
          problems.push(`${a.id} lists ${section}: "${slug}", but ${project}/${section}/${slug}.md doesn't exist`);
        }
      }
    }
  }

  if (problems.length) throw new Error(`Adventure problems:\n  ${problems.join('\n  ')}`);
  return map;
}

export async function getAdventure(projectId: string): Promise<Adventure> {
  checked ??= load();
  const all = await checked;
  return all.get(projectId) ?? { arcs: [], npcs: [], locations: [], items: [] };
}

export const hasAdventure = (a: Adventure) =>
  a.arcs.length + a.npcs.length + a.locations.length + a.items.length > 0;

// Arcs that feature a given NPC, location or item.
export function arcsFeaturing(adventure: Adventure, part: Part): Arc[] {
  const section = partSectionOf(part);
  const slug = partSlugOf(part);
  return adventure.arcs.filter((a) => a.data[section].includes(slug));
}

export const sectionLabel = (s: Section) => sections[s].label;
export const projectBase = (p: Project) => `/${p.data.domain}/${p.id}`;
