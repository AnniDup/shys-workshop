import { defineCollection, reference, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import {
  aiLevels,
  docTypes,
  games,
  keysOf,
  kinds,
  linkTypes,
  releasedStatuses,
  statuses,
  systems,
} from './config/taxonomy';

/*
  Folder layout, one folder per project:

  src/content/projects/
    oasis-adventure-map/
      index.md          <- the project (collection: projects)
      changelog.md      <- required for every project (collection: changelogs)
      docs/
        premise.md      <- a doc (collection: docs)
        gallery.md
      images/           <- image paths are relative to the .md file
*/

type ImageFn = SchemaContext['image'];

const link = z.object({
  label: z.string(),
  url: z.url(),
  type: z.enum(keysOf(linkTypes)),
});

// An image with required alt text; caption and detail are optional.
const figure = (image: ImageFn) =>
  z.object({
    src: image(),
    alt: z.string().min(1, 'Every image needs alt text'),
    caption: z.string().optional(),
    detail: z.string().optional(),
  });

// How AI was used. Models are required whenever AI was used at all.
const ai = z
  .object({
    level: z.enum(keysOf(aiLevels)),
    models: z.array(z.string()).default([]),
    notes: z.string().optional(),
  })
  .refine((a) => a.level === 'none' || a.models.length > 0, {
    message: 'List the models used, e.g. [Claude Opus 5.5]',
    path: ['models'],
  });

// Fields every project has, whatever its domain.
const projectBase = (image: ImageFn) =>
  z.object({
    title: z.string(),
    summary: z.string().max(160, 'Keep summaries under 160 characters for cards'),
    status: z.enum(keysOf(statuses)),
    // Current version, e.g. 0.3.0 or 1.2.0-beta
    version: z
      .string()
      .regex(/^\d+\.\d+(\.\d+)?(-[0-9A-Za-z.]+)?$/, 'Use a version like 1.2.0 or 0.4.0-beta')
      .optional(),
    updated: z.coerce.date(),
    started: z.coerce.date().optional(),
    // Date of first public release
    released: z.coerce.date().optional(),
    // Shown on cards in lists.
    thumbnail: figure(image).optional(),
    // Shown on the project page.
    images: z.array(figure(image)).default([]),
    tags: z.array(z.string()).default([]),
    links: z.array(link).default([]),
    draft: z.boolean().default(false),
    ai,
  });

const projects = defineCollection({
  loader: glob({
    pattern: '*/index.md',
    base: './src/content/projects',
    // id = folder name, e.g. "oasis-adventure-map"
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: ({ image }) =>
    z.discriminatedUnion('domain', [
      projectBase(image).extend({
        domain: z.literal('games'),
        game: z.enum(keysOf(games)),
        kind: z.enum(keysOf(kinds.games)),
        // Game version it's built for, e.g. 1.4.4.9
        gameVersion: z.string().optional(),
        // Other mods or DLC needed, e.g. [Automatron, Nuka-World]
        requires: z.array(z.string()).default([]),
      }),
      projectBase(image).extend({
        domain: z.literal('tabletop'),
        kind: z.enum(keysOf(kinds.tabletop)),
        // The system it was written for, e.g. fate-core
        system: z.enum(keysOf(systems)),
        // Other systems it has been adapted to, e.g. [dnd-5e]
        adaptations: z.array(z.enum(keysOf(systems))).default([]),
        // The setting project it belongs to, by folder name
        setting: reference('projects').optional(),
        // The rules project it uses, by folder name
        rules: reference('projects').optional(),
      }),
      projectBase(image).extend({
        domain: z.literal('digital'),
        kind: z.enum(keysOf(kinds.digital)),
        // Tools and tech used, e.g. [Astro, TypeScript]
        stack: z.array(z.string()).default([]),
        // Where it runs, e.g. [Web, Excel]
        platforms: z.array(z.string()).default([]),
      }),
      projectBase(image).extend({
        domain: z.literal('builds'),
        kind: z.enum(keysOf(kinds.builds)),
        // Engine, if any, e.g. Unity or Godot
        engine: z.string().optional(),
        // Where it runs, e.g. [Web, Android, Windows]
        platforms: z.array(z.string()).default([]),
        // Languages and tools, e.g. [C#, Blender]
        stack: z.array(z.string()).default([]),
      }),
      // Future domains add their own member here, e.g. tabletop with a `system` field.
    ])
    .refine((p) => !releasedStatuses.includes(p.status) || p.released, {
      message: 'Maintained and unmaintained projects need a released date',
      path: ['released'],
    }),
});

const swatch = z.object({
  name: z.string(),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a 6-digit hex, e.g. #91B168'),
  role: z.string().optional(),
});

const docs = defineCollection({
  loader: glob({
    pattern: '*/docs/*.md',
    base: './src/content/projects',
    // id = "project/doc", e.g. "oasis-adventure-map/premise"
    generateId: ({ entry }) => {
      const [project, , file] = entry.split('/');
      return `${project}/${file.replace(/\.md$/, '')}`;
    },
  }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        type: z.enum(keysOf(docTypes)),
        order: z.number().default(0),
        summary: z.string().optional(),
        palette: z.array(swatch).optional(),
        images: z.array(figure(image)).optional(),
        draft: z.boolean().default(false),
      })
      .refine((d) => !d.palette || d.type === 'palette', {
        message: 'Only palette docs can have a palette field',
        path: ['palette'],
      })
      .refine((d) => !d.images || d.type === 'gallery', {
        message: 'Only gallery docs can have an images field',
        path: ['images'],
      }),
});

// Every project has a changelog.md beside its index.md. Plain markdown.
const changelogs = defineCollection({
  loader: glob({
    pattern: '*/changelog.md',
    base: './src/content/projects',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: z.object({}),
});

// Adventure parts: one file per NPC, location or item, inside a Tabletop project.
//   <project>/npcs/captain-salt.md -> id "<project>/npcs/captain-salt"
const parts = defineCollection({
  loader: glob({
    pattern: '*/{npcs,locations,items}/*.md',
    base: './src/content/projects',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string().optional(),
      // true: shown in full on the section's list, no page of its own
      brief: z.boolean(),
      order: z.number().default(0),
      images: z.array(figure(image)).default([]),
      draft: z.boolean().default(false),
    }),
});

// Story arcs: one file per arc, scenes written in the body.
//   <project>/arcs/the-stolen-chart.md -> id "<project>/the-stolen-chart"
const arcs = defineCollection({
  loader: glob({
    pattern: '*/arcs/*.md',
    base: './src/content/projects',
    generateId: ({ entry }) => {
      const [project, , file] = entry.split('/');
      return `${project}/${file.replace(/\.md$/, '')}`;
    },
  }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    summary: z.string().optional(),
    // File names (without .md) of the NPCs, locations and items in this arc
    npcs: z.array(z.string()).default([]),
    locations: z.array(z.string()).default([]),
    items: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

// Notebook: rough notes and ideas, one file per note in src/content/notes/.
const notes = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    // The project this idea became or relates to, by folder name.
    project: reference('projects').optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, docs, changelogs, notes, parts, arcs };
