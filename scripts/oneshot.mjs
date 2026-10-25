#!/usr/bin/env node
// Runs Claude Code non-interactively on a one-shot transcript with the
// new-oneshot skill (.claude/skills/new-oneshot/SKILL.md).
// Usage: pnpm oneshot -- audio/<file>.txt

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const transcriptArg = process.argv[2];
if (!transcriptArg) {
  console.error('Usage: pnpm oneshot -- audio/<file>.txt');
  process.exit(1);
}

const transcriptPath = path.resolve(transcriptArg);
if (!fs.existsSync(transcriptPath)) {
  console.error(`File not found: ${transcriptPath}`);
  process.exit(1);
}

const relTranscript = path.relative(process.cwd(), transcriptPath);
const model = process.env.CLAUDE_MODEL || 'sonnet';

const prompt = `Use the new-oneshot skill on ${relTranscript}: it's the raw transcript of the latest one-shot, produced by automatic speech-to-text, so expect recognition errors and mangled names. You're running non-interactively and can't ask questions: make the most reasonable choice for anything ambiguous and flag it in the final report.`;

console.log(`Running Claude Code (model: ${model}) on ${relTranscript}...\n`);

const child = spawn(
  'claude',
  ['-p', prompt, '--allowedTools', 'Skill,Read,Write,Edit,Grep,Glob,WebFetch,Bash(pnpm build)', '--model', model],
  { stdio: 'inherit', cwd: process.cwd() }
);

child.on('error', (err) => {
  console.error('Could not start "claude". Is it installed and on your PATH?', err.message);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
