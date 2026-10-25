---
name: new-oneshot
description: Turn a one-shot transcript into site updates — writes the adventure's notice for the board and creates/updates every character (recurring ones included), NPC and place it touches. Use when the user pastes a game transcript (usually Italian, often messy speech-to-text), points at a transcript file such as audio/<file>.txt, or asks to "add/process/write up the latest one-shot".
---

# New one-shot

Turn a raw transcript into a complete, cross-linked update of the site. All content you write is in **Italian**; follow the conventions in `CLAUDE.md` (wikilinks, spoilers, canonical names, recurring characters, don'ts).

The transcript is either pasted in the conversation or in a file passed as the argument. Automatic transcripts contain misheard words and mangled names — never silently guess: resolve what you can, and list the rest in the final report.

**Public site.** The site is public and indexed:

- Players and the DM are referred to only by their characters / role. Transcripts are full of real names ("Marco, tira l'iniziativa"): work out which character each player runs from context and the existing `personaggi/` files, and never write a real name anywhere.
- Write only what the party learned in play. Skip DM asides and explanations, out-of-character chatter, things the DM said by mistake and took back, and secrets one character learned privately unless they shared them with the group.

## 1. Gather context

Before writing anything:

- Grep `^numero:` in `src/content/avventure/` to get the next notice number (highest + 1), then read the latest adventure for tone.
- Grep `^titolo:` in `src/content/personaggi/`, `png/` and `luoghi/` for the list of existing entities. Every name you meet in the transcript must be matched against it — including near-misses from speech recognition. **Characters recur across one-shots**: a returning character keeps their file; a new one gets a new file.
- Work out the game system (`sistema`, a key of `src/lib/systems.ts`; D&D 5e is `dnd5e`), the characters' level, and whether the DM ran a published adventure (`fonte`) or a homebrew one, and its setting (`ambientazione`) if it's stated. If the system isn't in `systems.ts`, stop and ask (interactively) or flag it in the report — don't invent a key.
- For names you can't match, and to identify a published adventure, check the system's reference named in `CLAUDE.local.md` (if there is none, flag them in the report instead). Use it for spelling and to disambiguate only — never bring in anything the party hasn't experienced: other groups may still play that adventure.

## 2. Write the adventure

Create `src/content/avventure/<slug>.md`, where the slug is the kebab-case, accent-free title (e.g. `il-faro-spento.md`):

```yaml
---
titolo: <evocative title>
numero: <N>
data: <YYYY-MM-DD — the real date played if known; interactively, ask if unknown; otherwise today and flag it>
sistema: <dnd5e>
livello: <character level, if the system has levels>
fonte: <published adventure, if any; omit for homebrew>
ambientazione: <setting, if known>
personaggi: [<titolo of each player character who took part>]
esito: <compiuta | fallita | in corso — only if clear from play; in corso when it continues another evening>
estratto: <1-2 sentences, max 300 characters (schema-enforced), self-contained: it's the notice text and the meta description>
tag: [<optional, short>]
---
```

Leave `master` out unless the user gives a nickname to show.

Body: a third-person narrative in Italian that tells the adventure from the hook to the ending, split into `##` sections by scene. Past tense or narrative present, consistent with the other adventures. Keep it readable prose — no raw transcript, no out-of-character table talk, no rules chatter unless it matters to the story. Link every entity on its first mention in each section.

A one-shot that spills over into a second evening stays in the same file: append new `##` sections and update `esito`.

## 3. Characters

For each player character:

- **Returning:** list them in `personaggi`, update frontmatter that changed (`stato`, `classe` if they multiclassed…), and **append** a paragraph about what they did in this adventure, linking the adventure (`[[<titolo dell'avventura>]]`). Don't rewrite earlier history.
- **New:** create `personaggi/<slug>.md` with `titolo`, `classe`, `razza`, `sistema`, `stato` (gendered: `vivo`/`viva`, `morto`/`morta`, `scomparso`/`scomparsa`, `ritirato`/`ritirata`), `estratto`, `tag`. Leave `giocatore` out (no real names). Set `immagine: /images/personaggi/<id>.png` only if that file exists. Body: who they are as shown in play, then a paragraph on this adventure.

## 4. NPCs and places

For each NPC or place that appears for the first time, create a file named after the kebab-case, accent-free title. Fields besides `titolo` are optional; fill in what is known, use `sconosciuto` for things that matter but aren't known yet.

- `png/`: `titolo`, `ruolo` (short: it's what the margin notes show), `stato` (`vivo`|`viva`|`morto`|`morta`|`scomparso`|`scomparsa`|`sconosciuto`), `fazione`, `luogo`, `estratto`, `tag`.
- `luoghi/`: `titolo`, `tipo`, `regione`, `estratto`, `tag`.

Body: a short Italian paragraph with what the party knows and how they met it, linked to the adventure and other entities. If an NPC or place already exists (a recurring tavern, a known villain), update and append instead.

## 5. Verify

Run `pnpm build` and check the output:

- It must succeed (schema errors, e.g. `estratto` over 300 characters or an unknown `sistema`, fail the build).
- Fix every `[wikilinks] Unresolved link` warning by correcting the target or creating the missing entity.
- Fix every `[party]` warning: each `personaggi` name must match a character's `titolo` or filename.

## 6. Report

End with a short report:

- Adventure file created, entities created, entities updated (say which characters were returning).
- **Ambiguities**: every name or detail you had to interpret, with your choice (e.g. "«Bran» → Brann Pietrascura", "unclear whether the guardian died: left `stato: sconosciuto`", "source identified as Ghosts of Saltmarsh from the NPC names").
- Anything left for the user: a missing date, and for new player characters the portraits to add in `public/images/personaggi/` (`<id>.png` square, then set `immagine`; optionally `<id>-full.png` tall).
- A suggested commit message, e.g. `feat(content): add il-faro-spento`.

Don't commit — the user reviews `git diff` first.
