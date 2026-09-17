#!/usr/bin/env node
/**
 * breakdown.mjs — per-turn host counters for one session, to locate where tokens went.
 *
 * A round-level sum can hide a pathology (one giant tool output, one cache-invalidating edit).
 * This prints every counted turn, then the heaviest turns, so an outlier is attributable or
 * explainable rather than merely reported.
 *
 * Usage (from the repository root):
 *   node apps/benchmark/scripts/breakdown.mjs --session <session_id>
 *   node apps/benchmark/scripts/breakdown.mjs --session <session_id> --top 5
 */

import { createReadStream, existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';

const USAGE_KEYS = [
  'input', 'input_tokens', 'prompt_tokens',
  'output', 'output_tokens', 'completion_tokens',
  'cacheRead', 'cache_read', 'cache_read_input_tokens',
  'totalTokens', 'total_tokens',
];

function parseArgs(argv) {
  const parsed = { top: 5 };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--session') parsed.session = argv[++index];
    else if (token === '--top') parsed.top = Number(argv[++index]);
    else if (token === '--data-dir') parsed.dataDir = argv[++index];
    else throw new Error(`unknown argument: ${token}`);
  }
  if (!parsed.session) throw new Error('--session is required');
  return parsed;
}

const num = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

function locateUsage(record) {
  if (!record || typeof record !== 'object') return null;
  const candidates = [
    record.message && typeof record.message === 'object' ? record.message.usage : null,
    record.usage,
    record.message,
    record,
  ];
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') continue;
    if (USAGE_KEYS.some((key) => key in candidate)) return candidate;
  }
  return null;
}

function readUsage(record) {
  const raw = locateUsage(record);
  if (!raw) return null;
  return {
    input: num(raw.input ?? raw.input_tokens ?? raw.prompt_tokens),
    output: num(raw.output ?? raw.output_tokens ?? raw.completion_tokens),
    cacheRead: num(raw.cacheRead ?? raw.cache_read ?? raw.cache_read_input_tokens),
    totalTokens: num(raw.totalTokens ?? raw.total_tokens),
  };
}

async function findSessionDir(sessionsRoot, sessionId) {
  const suffixes = [sessionId];
  try {
    suffixes.push(Buffer.from(sessionId, 'utf8').toString('base64').replace(/=+$/, ''));
  } catch {
    // non-UTF8 ids still match on the raw form
  }
  for (const year of await readdir(sessionsRoot).catch(() => [])) {
    for (const month of await readdir(path.join(sessionsRoot, year)).catch(() => [])) {
      for (const day of await readdir(path.join(sessionsRoot, year, month)).catch(() => [])) {
        const dayDir = path.join(sessionsRoot, year, month, day);
        const hit = (await readdir(dayDir).catch(() => []))
          .find((name) => suffixes.some((suffix) => name.endsWith(suffix)));
        if (hit) return path.join(dayDir, hit);
      }
    }
  }
  return null;
}

const args = parseArgs(process.argv.slice(2));
const dataDir = args.dataDir ?? process.env.MINIMAX_DATA_DIR ?? path.join(os.homedir(), '.minimax');
const sessionsRoot = path.join(dataDir, 'v2', 'sessions');
if (!existsSync(sessionsRoot)) throw new Error(`sessions root not found: ${sessionsRoot}`);

const sessionDir = await findSessionDir(sessionsRoot, args.session);
if (!sessionDir) throw new Error(`session directory not found for ${args.session}`);
const messagesPath = path.join(sessionDir, 'messages.jsonl');

const turns = [];
let ordinal = 0;
const lines = readline.createInterface({
  input: createReadStream(messagesPath, { encoding: 'utf8' }),
  crlfDelay: Infinity,
});
for await (const line of lines) {
  const text = line.trim();
  if (!text) continue;
  let record;
  try {
    record = JSON.parse(text);
  } catch {
    continue;
  }
  const usage = readUsage(record);
  if (!usage) continue;
  ordinal += 1;
  turns.push({
    ordinal,
    input: usage.input,
    output: usage.output,
    cacheRead: usage.cacheRead,
    total: usage.totalTokens || usage.input + usage.cacheRead + usage.output,
  });
}

const sum = (key) => turns.reduce((acc, turn) => acc + turn[key], 0);
console.log(`session  ${args.session}`);
console.log(`dir      ${sessionDir}`);
console.log(`turns    ${turns.length}`);
console.log(`input    ${sum('input')}`);
console.log(`output   ${sum('output')}`);
console.log(`cacheRead ${sum('cacheRead')}`);
console.log(`total    ${sum('total')}`);
console.log('\nper-turn (uncached input / output / cacheRead / total):');
for (const turn of turns) {
  console.log(
    `  #${String(turn.ordinal).padStart(3)}  ${String(turn.input).padStart(8)}  ` +
    `${String(turn.output).padStart(6)}  ${String(turn.cacheRead).padStart(8)}  ${String(turn.total).padStart(9)}`,
  );
}

const heaviest = [...turns].sort((a, b) => b.input - a.input).slice(0, args.top);
console.log(`\nheaviest ${heaviest.length} turns by uncached input:`);
for (const turn of heaviest) {
  const share = sum('input') > 0 ? ((turn.input / sum('input')) * 100).toFixed(1) : '0.0';
  console.log(`  #${String(turn.ordinal).padStart(3)}  ${String(turn.input).padStart(8)}  (${share}% of all uncached input)`);
}
