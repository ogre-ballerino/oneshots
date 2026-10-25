import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { curlyQuotes } from './lib/wikilinks.mjs';
import { systemIds } from './lib/systems';

const baseFields = {
  titolo: z.string(),
  estratto: z.string().max(300).transform(curlyQuotes).optional(),
  immagine: z.string().optional(),
  tag: z.array(z.string()).default([]),
};

const sistema = z.enum(systemIds).default('dnd5e');

const avventure = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/avventure' }),
  schema: z.object({
    ...baseFields,
    numero: z.number().int().positive(),
    data: z.coerce.date(),
    sistema,
    livello: z.number().int().positive().optional(),
    ambientazione: z.string().optional(),
    fonte: z.string().optional(),
    master: z.string().optional(),
    personaggi: z.array(z.string()).default([]),
    esito: z.enum(['compiuta', 'fallita', 'in corso']).optional(),
  }),
});

const personaggi = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/personaggi' }),
  schema: z.object({
    ...baseFields,
    giocatore: z.string().optional(),
    classe: z.string().optional(),
    razza: z.string().optional(),
    sistema,
    stato: z.enum(['vivo', 'viva', 'morto', 'morta', 'scomparso', 'scomparsa', 'ritirato', 'ritirata']).default('vivo'),
  }),
});

const png = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/png' }),
  schema: z.object({
    ...baseFields,
    ruolo: z.string().transform(curlyQuotes).optional(),
    stato: z.enum(['vivo', 'viva', 'morto', 'morta', 'scomparso', 'scomparsa', 'sconosciuto']).default('vivo'),
    fazione: z.string().optional(),
    luogo: z.string().optional(),
  }),
});

const luoghi = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/luoghi' }),
  schema: z.object({
    ...baseFields,
    tipo: z.string().optional(),
    regione: z.string().optional(),
  }),
});

export const collections = { avventure, personaggi, png, luoghi };
