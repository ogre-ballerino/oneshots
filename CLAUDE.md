# La Bacheca dell'Ogre — project conventions

Companion site for the one-shots played at the Ogre Ballerino, built with Astro. Each one-shot is a notice pinned to a tavern quest board; characters can come back from one adventure to the next. The sections (avventure, personaggi, PNG, luoghi) are cross-linked with Obsidian-style wikilinks. Forked from the [strahd](https://github.com/sirlisko/strahd) campaign site.

**Language:** all site content (everything under `src/content/` and any user-visible text in pages/components) is written in **Italian**. Code, comments, commit messages and docs are in English. Collection names, frontmatter keys and URL routes are Italian and must stay that way.

**Game systems:** every one-shot and every character has a `sistema` (default `dnd5e`, the only one for now). The list lives in `src/lib/systems.ts`; adding a system is one entry there, plus its reference source in `CLAUDE.local.md`. A new system may need its own character fields (e.g. `professione` instead of `classe`): add them to the schema rather than overloading existing ones.

## Content conventions

These apply to every content edit, by hand or through a skill.

- **New one-shots:** when the user pastes a transcript or points at one (e.g. `audio/<file>.txt`), use the `new-oneshot` skill (`.claude/skills/new-oneshot/SKILL.md`). It covers the whole procedure: adventure file, new and returning characters, NPCs, places, verification.
- **Renames and merges:** to rename an entity or merge duplicates, use the `rename-entity` skill (`.claude/skills/rename-entity/SKILL.md`). Never change a `titolo` or a filename by hand: wikilinks, backlinks and the page URL (already indexed by search engines) depend on them.
- **Recurring characters:** a character has ONE file for their whole career. Before creating a character, match the name against `src/content/personaggi/` (including speech-to-text near-misses); if they already exist, list them in the adventure's `personaggi` and append a paragraph about this adventure to their file.
- **No real names:** the site is public and indexed. Players appear only as their characters — never write a player's real name anywhere in `src/content/`, even though transcripts are full of them. The same goes for the DM: leave `master` (and `giocatore`) empty unless the user explicitly gives a name or nickname to show there.
- **Wikilinks:** ALWAYS link entities with Obsidian-style wikilinks: `[[Nome Entità]]` for plain text, `[[Nome Entità|testo visualizzato]]` for an alias (e.g. to inflect a name). Use the entity's exact `titolo` (or its filename) as the target — resolution is case/accent-insensitive but works best with a near-exact match.
- **One canonical file per entity:** search the existing files before creating a new one; names with slight spelling variants must be unified into ONE file. NPCs and places usually belong to a single adventure, but when one comes back, reuse its file.
- **No spoilers:** only write what the party learned in play. Leave out DM asides, out-of-character explanations, slips the DM corrected, and anything only one character learned in secret unless it was shared with the group. Published adventures may be played again by other groups who read this site: to check the canonical spelling of a name, identify the source adventure or clarify an ambiguous detail, use the system's reference (set in `CLAUDE.local.md`, which is gitignored), but never copy from it anything the characters didn't experience (unexplored rooms, unrevealed twists, alternative endings).
- **Append, don't rewrite:** when an existing entity changes, update its frontmatter (`stato`, `luogo`, …) and add a paragraph about the new development; don't rewrite earlier history.
- **Gendered `stato`:** `stato` agrees with the character: `vivo`/`viva`, `morto`/`morta`, `scomparso`/`scomparsa`, `ritirato`/`ritirata` (characters), `sconosciuto` (NPCs).

### Audio → one-shot pipeline (optional)

Instead of pasting the transcript, the user can start from a recording in `audio/` (gitignored): `pnpm transcribe` transcribes it locally (Parakeet TDT v3 via `parakeet-coreml`, macOS 14+ on Apple Silicon, needs `ffmpeg`), then `pnpm oneshot -- audio/<file>.txt` runs Claude Code non-interactively (`claude -p`) with the `new-oneshot` skill. In that mode you can't ask questions: make the most reasonable choice and flag every ambiguity in the final report.

## Commits

Conventional commits, subject line only. Content updates use the `content` scope, e.g. `feat(content): add il-faro-spento`, `fix(content): merge Bran into Brann Pietrascura`.

## Don'ts

- Don't invent a second linking system: use only `[[...]]`, never manual markdown links `[testo](/percorso)` for internal references between entities.
- Don't add a `slug` field to frontmatter (Astro derives the id from the filename; `slug` is reserved for a possible override).
- Don't install extra UI frameworks (no Tailwind/React/Vue) — the site uses plain CSS and pure Astro.

## Technical notes

- Site name and default description live in `src/lib/site.ts`.
- Wikilinks are resolved at build time by `src/lib/wikilinks.mjs` (slug map) and `src/lib/remark-wikilinks.mjs` (remark plugin). A wikilink to a missing entity doesn't break the build: it renders as text styled as a "broken link" and logs a console warning — handy for spotting typos.
- An adventure's party comes from its `personaggi` frontmatter (names resolved like wikilinks by `src/lib/party.ts`; an unknown name logs a `[party]` warning). It drives the avatars on its notice, the "Gli habitué" ranking and, via `src/lib/backlinks.ts`, the adventures listed on each character's page.
- Backlinks ("Menzionato in") are computed by `src/lib/backlinks.ts` by scanning the markdown body of every entry, plus each adventure's `personaggi`. The NPC index groups each NPC under the first adventure that mentions them.
- Adventure pages get margin notes on wide screens: `remark-wikilinks.mjs` lists, after each `##` heading, the NPCs and places mentioned there for the first time, with their `ruolo` (or `tipo`) and a † when they're dead. Keep `ruolo` short: it's what the margin shows.
- Astro caches rendered markdown in `node_modules/.astro/data-store.json` and doesn't notice changes to the remark plugins: delete that file after editing them, or old renders stick around.
- The look is a tavern quest board: oak planks drawn in CSS with paper pinned to them. Color tokens are in `src/styles/tokens.css`; dark mode follows the system setting and only darkens the wall, while the paper keeps its light palette. Styles are split by area in `src/styles/` (`base`, `chrome`, `board`, `entry`, `lists`, `search`).
- In `astro dev`, a new file added to `src/content/` may not be picked up right away by already-cached wikilinks: restart the dev server after adding new entities.
- The site is indexable by search engines: `public/robots.txt` allows all crawlers and points to the sitemap generated by `@astrojs/sitemap`. Entry pages use their `estratto` as the meta description, so keep it a self-contained sentence.
- Character portraits live in `public/images/personaggi/`: `<id>.png` (square, referenced by the `immagine` frontmatter field, used for avatars) and `<id>-full.png` (tall, used on the character page and in "Gli habitué" — picked up automatically). Without either, the character gets a wax seal with their initials.
- `src/content/` can be opened directly as an Obsidian vault to browse the links graphically.
- Files starting with `_` are drafts: skipped by the collections and by the wikilink slug map.
- Search (`/cerca`, `src/pages/cerca.astro`) uses Pagefind: the index is generated by `pnpm build` (the `pagefind --site dist` step) and so does NOT exist in `astro dev` — to try it, use `pnpm build && pnpm preview`. Only pages using `EntryLayout` (`data-pagefind-body`) are indexed, with a `sezione` filter; metadata, badges, backlinks and pagination are excluded with `data-pagefind-ignore`. Supports `/cerca/?q=term`.
- Deployed on Netlify (project `ogre-oneshots`) at https://oneshots.ogreballerino.com, building on every push to `main`.
