import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;
export type Doc = CollectionEntry<'docs'>;
export type Changelog = CollectionEntry<'changelogs'>;
export type Note = CollectionEntry<'notes'>;

// Drafts show while developing and are left out of the live build.
const visible = (e: { data: { draft: boolean } }) => import.meta.env.DEV || !e.data.draft;

export async function getProjects(): Promise<Project[]> {
  const [all, changelogs] = await Promise.all([
    getCollection('projects', visible),
    getCollection('changelogs'),
  ]);

  // Every project must have a changelog.md.
  const logged = new Set(changelogs.map((c) => c.id));
  const missing = all.filter((p) => !logged.has(p.id));
  if (missing.length) {
    throw new Error(
      `Projects without a changelog.md: ${missing.map((p) => p.id).join(', ')}`,
    );
  }

  return all.sort((a, b) => b.data.updated.getTime() - a.data.updated.getTime());
}

export async function getChangelog(projectId: string): Promise<Changelog> {
  const changelogs = await getCollection('changelogs');
  return changelogs.find((c) => c.id === projectId)!;
}

export async function getDocs(): Promise<Doc[]> {
  const [docs, projects] = await Promise.all([
    getCollection('docs', visible),
    getCollection('projects'),
  ]);

  // Every doc must sit inside a project folder that has an index.md.
  const ids = new Set(projects.map((p) => p.id));
  const orphans = docs.filter((d) => !ids.has(projectIdOf(d)));
  if (orphans.length) {
    throw new Error(
      `Docs without a project index.md: ${orphans.map((d) => d.id).join(', ')}`,
    );
  }

  return docs;
}

export const projectIdOf = (doc: Doc) => doc.id.split('/')[0];
export const docSlugOf = (doc: Doc) => doc.id.split('/')[1];

export async function getDocsFor(projectId: string): Promise<Doc[]> {
  const docs = await getDocs();
  return docs
    .filter((d) => projectIdOf(d) === projectId)
    .sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
}

// Domains that currently have at least one visible project.
export async function getActiveDomains() {
  const projects = await getProjects();
  return new Set(projects.map((p) => p.data.domain));
}

export async function getProjectsIn(domain: string): Promise<Project[]> {
  const projects = await getProjects();
  return projects.filter((p) => p.data.domain === domain);
}

// Dates shown as e.g. 26 Sep 2026.
export const formatDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// Notebook entries, newest first.
export async function getNotes(): Promise<Note[]> {
  const notes = await getCollection('notes', visible);
  return notes.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
