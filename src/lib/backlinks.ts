import { getCollection } from 'astro:content';
import { getSlugMap, normalize, WIKILINK_RE } from './wikilinks.mjs';

type Backlink = { title: string; url: string; numero?: number };

let backlinkCache: Map<string, Backlink[]> | null = null;

const COLLECTIONS = ['avventure', 'personaggi', 'png', 'luoghi'] as const;

async function buildBacklinkIndex() {
  const index = new Map<string, Backlink[]>();
  const slugMap = getSlugMap();

  for (const collectionName of COLLECTIONS) {
    const entries = await getCollection(collectionName);
    for (const entry of entries) {
      const sourceEntry = slugMap.get(normalize(entry.data.titolo ?? entry.id));
      if (!sourceEntry) continue;

      const names = [...(entry.body ?? '').matchAll(WIKILINK_RE)].map((m) => m[1]);
      // A character who played an adventure but is never linked in its text
      // still belongs to it.
      if ('personaggi' in entry.data) names.push(...entry.data.personaggi);

      for (const name of names) {
        const target = slugMap.get(normalize(name));
        if (!target || target.url === sourceEntry.url) continue;
        const list = index.get(target.url) ?? [];
        if (!list.some((l) => l.url === sourceEntry.url)) {
          list.push({
            title: sourceEntry.title,
            url: sourceEntry.url,
            numero: 'numero' in entry.data ? entry.data.numero : undefined,
          });
        }
        index.set(target.url, list);
      }
    }
  }
  return index;
}

export async function getBacklinksFor(url: string): Promise<Backlink[]> {
  if (!backlinkCache) backlinkCache = await buildBacklinkIndex();
  return backlinkCache.get(url) ?? [];
}
