import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;
export type Doc = CollectionEntry<'docs'>;

// Drafts show while developing and are left out of the live build.
const visible = (e: { data: { draft: boolean } }) => import.meta.env.DEV || !e.data.draft;

export async function getProjects(): Promise<Project[]> {
  const all = await getCollection('projects', visible);
  return all.sort((a, b) => b.data.updated.getTime() - a.data.updated.getTime());
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
