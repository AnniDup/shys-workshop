import { domains, kinds } from '../config/taxonomy';
import type { Project } from './content';

// The project's category (e.g. its game), if its domain has one.
export function categoryOf(project: Project) {
  const category = domains[project.data.domain].category;
  if (!category) return undefined;
  const value = (project.data as Record<string, unknown>)[category.key] as string;
  const option = category.options[value];
  return { key: category.key, value, label: option.label, colour: option.colour };
}

// Display name of the project's kind, e.g. "Map" or "Site".
export function kindLabelOf(project: Project): string {
  return (kinds[project.data.domain] as Record<string, string>)[project.data.kind];
}

// Accent colour: the category's colour, or the domain's if there's no category.
export function colourOf(project: Project): string {
  return categoryOf(project)?.colour ?? domains[project.data.domain].colour;
}

// Up to three initials, e.g. "Oxygen Not Included" -> "ONI".
export function initialsOf(text: string): string {
  return text
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}
