import { getCollection, type CollectionEntry } from 'astro:content';
import { normalize } from './wikilinks.mjs';

type Adventure = CollectionEntry<'avventure'>;
type Character = CollectionEntry<'personaggi'>;

let partyCache: Map<string, Character[]> | null = null;

// Resolves each adventure's `personaggi` names to character entries, matched
// like wikilinks (by titolo or filename).
async function buildPartyIndex() {
  const characters = new Map<string, Character>();
  for (const c of await getCollection('personaggi')) {
    characters.set(normalize(c.id), c);
    characters.set(normalize(c.data.titolo), c);
  }

  const index = new Map<string, Character[]>();
  for (const adventure of await getCollection('avventure')) {
    const party = adventure.data.personaggi.flatMap((name) => {
      const character = characters.get(normalize(name));
      if (!character) console.warn(`[party] ${adventure.id}: "${name}" is not a character`);
      return character ? [character] : [];
    });
    index.set(adventure.id, party);
  }
  return index;
}

export async function partyOf(adventure: Adventure): Promise<Character[]> {
  partyCache ??= await buildPartyIndex();
  return partyCache.get(adventure.id) ?? [];
}

export async function adventureCount(character: Character): Promise<number> {
  partyCache ??= await buildPartyIndex();
  return [...partyCache.values()].filter((party) => party.some((c) => c.id === character.id)).length;
}
