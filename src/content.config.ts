import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { docTypes, games, keysOf, kinds, linkTypes, statuses } from './config/taxonomy';

/*
  Folder layout, one folder per project:

  src/content/projects/
    vault-88/
      index.md          <- the project (collection: projects)
      docs/
        premise.md      <- a doc (collection: docs)
        design.md
      images/
*/

const link = z.object({
  label: z.string(),
  url: z.url(),
  type: z.enum(keysOf(linkTypes)),
});

// Fields every project has, whatever its domain.
const projectBase = (image: () => z.ZodType) =>
  z.object({
    title: z.string(),
    summary: z.string().max(160, 'Keep summaries under 160 characters for cards'),
    status: z.enum(keysOf(statuses)),
    updated: z.coerce.date(),
    started: z.coerce.date().optional(),
    cover: image().optional(),
    tags: z.array(z.string()).default([]),
    links: z.array(link).default([]),
    draft: z.boolean().default(false),
  });

const projects = defineCollection({
  loader: glob({
    pattern: '*/index.md',
    base: './src/content/projects',
    // id = folder name, e.g. "vault-88"
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: ({ image }) =>
    z.discriminatedUnion('domain', [
      projectBase(image).extend({
        domain: z.literal('games'),
        game: z.enum(keysOf(games)),
        kind: z.enum(keysOf(kinds.games)),
      }),
      // Future domains add their own member here, e.g. tabletop with a `system` field.
    ]),
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
    // id = "project/doc", e.g. "vault-88/premise"
    generateId: ({ entry }) => {
      const [project, , file] = entry.split('/');
      return `${project}/${file.replace(/\.md$/, '')}`;
    },
  }),
  schema: z
    .object({
      title: z.string(),
      type: z.enum(keysOf(docTypes)),
      order: z.number().default(0),
      summary: z.string().optional(),
      palette: z.array(swatch).optional(),
      draft: z.boolean().default(false),
    })
    .refine((d) => !d.palette || d.type === 'palette', {
      message: 'Only palette docs can have a palette field',
      path: ['palette'],
    }),
});

export const collections = { projects, docs };
