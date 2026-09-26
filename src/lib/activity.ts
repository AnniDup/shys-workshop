import { domains, statuses, type Phase } from '../config/taxonomy';
import { getChangelog, getNotes, getProjects, type Project } from './content';

export const phaseOf = (project: Project): Phase => statuses[project.data.status].phase;

/*
  Reads the newest entry from a changelog. Expected headings:
    ## 0.7.0 (26 Sep 2026)
    ## Unreleased
  The first bullet under the heading becomes the entry's summary.
*/
const HEADING = /^##\s+(?:(\d+\.\d+(?:\.\d+)?(?:-[0-9A-Za-z.]+)?)\s+\((\d{1,2} [A-Za-z]{3,9} \d{4})\)|(Unreleased))\s*$/;

export type LatestEntry = { version?: string; date?: Date; summary?: string };

export function latestEntry(projectId: string, body = ''): LatestEntry | undefined {
  const lines = body.split(/\r?\n/);
  const start = lines.findIndex((l) => l.startsWith('## '));
  if (start === -1) return undefined;

  const match = lines[start].match(HEADING);
  if (!match) {
    throw new Error(
      `Changelog heading in ${projectId} should look like "## 1.2.0 (26 Sep 2026)" or "## Unreleased", found: ${lines[start]}`,
    );
  }

  const [, version, dateText] = match;
  const date = dateText ? new Date(`${dateText} 12:00 UTC`) : undefined;
  if (date && Number.isNaN(date.getTime())) {
    throw new Error(`Changelog date in ${projectId} isn't a valid date: ${dateText}`);
  }

  // First bullet after the heading, stopping at the next heading.
  let summary: string | undefined;
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith('## ')) break;
    if (line.startsWith('- ')) {
      summary = line.slice(2).trim();
      break;
    }
  }

  return { version, date, summary };
}

export type ActivityItem = {
  date: Date;
  label: string; // e.g. v0.7.0, Update, Note
  title: string;
  href: string;
  summary?: string;
};

// Latest changelog entry from every project, plus notebook entries, newest first.
export async function getActivity(limit = 8): Promise<ActivityItem[]> {
  const [projects, notes] = await Promise.all([getProjects(), getNotes()]);

  const fromProjects = await Promise.all(
    projects.map(async (p): Promise<ActivityItem | undefined> => {
      const changelog = await getChangelog(p.id);
      const entry = latestEntry(p.id, changelog.body);
      if (!entry) return undefined;
      return {
        // Unreleased entries have no date of their own, so use the project's updated date.
        date: entry.date ?? p.data.updated,
        label: entry.version ? `v${entry.version}` : 'Update',
        title: p.data.title,
        href: `/${p.data.domain}/${p.id}/changelog`,
        summary: entry.summary,
      };
    }),
  );

  const fromNotes: ActivityItem[] = notes.map((n) => ({
    date: n.data.updated ?? n.data.date,
    label: 'Note',
    title: n.data.title,
    href: `/notebook/${n.id}`,
  }));

  return [...fromProjects.filter((x): x is ActivityItem => !!x), ...fromNotes]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}

// Per-domain counts by phase, for domains that have projects.
export async function getDomainSummary() {
  const projects = await getProjects();
  return (Object.keys(domains) as (keyof typeof domains)[])
    .map((domain) => {
      const inDomain = projects.filter((p) => p.data.domain === domain);
      const count = (phase: Phase) => inDomain.filter((p) => phaseOf(p) === phase).length;
      return {
        domain,
        label: domains[domain].label,
        total: inDomain.length,
        active: count('active'),
        queued: count('queued'),
        shipped: count('shipped'),
      };
    })
    .filter((d) => d.total > 0);
}
