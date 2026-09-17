#!/usr/bin/env node
/**
 * capture-tokens.mjs — sum host-reported token counters from local session records.
 *
 * Record shapes and reporting rules: ../spec/protocol.md
 *
 * Usage (run from the repository root):
 *   node apps/benchmark/scripts/capture-tokens.mjs
 *   node apps/benchmark/scripts/capture-tokens.mjs --manifest apps/benchmark/results/runs.json \
 *       --out apps/benchmark/results/tokens-2026-09-17.json
 *   node apps/benchmark/scripts/capture-tokens.mjs --session <session_id> --label self-test
 *
 * Session records live at <data dir>/v2/sessions/YYYY/MM/DD/<HH-MM-SS>-<session_id>/messages.jsonl,
 * one record per assistant turn. Summing a session's records yields its real token counters.
 */

import { existsSync } from 'node:fs';
import { createReadStream } from 'node:fs';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BENCH = path.resolve(HERE, '..');

const USAGE_KEYS = [
  'input', 'input_tokens', 'prompt_tokens',
  'output', 'output_tokens', 'completion_tokens',
  'cacheRead', 'cache_read', 'cache_read_input_tokens',
  'cacheWrite', 'cache_write', 'cache_creation_input_tokens',
  'totalTokens', 'total_tokens',
];

function parseArgs(argv) {
  const parsed = { runs: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--manifest') parsed.manifest = argv[++index];
    else if (token === '--out') parsed.out = argv[++index];
    else if (token === '--data-dir') parsed.dataDir = argv[++index];
    else if (token === '--session') parsed.runs.push({ sessionId: argv[++index] });
    else if (token === '--label') parsed.runs[parsed.runs.length - 1].label = argv[++index];
    else throw new Error(`unknown argument: ${token}`);
  }
  return parsed;
}

function num(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

/**
 * Finds the usage object in a messages.jsonl record. Observed locations, most specific first:
 *   `message.usage` (nested { input, output, cacheRead, cacheWrite, totalTokens, cost })
 *   `message.input_tokens` … (flat counters on the message)
 *   `usage` / top-level counters (flat record shapes)
 */
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

/** Accepts both observed record shapes: a nested `usage` object, or flat counters on the record. */
function readUsage(record) {
  const raw = locateUsage(record);
  if (!raw) return null;
  return {
    input: num(raw.input ?? raw.input_tokens ?? raw.prompt_tokens),
    output: num(raw.output ?? raw.output_tokens ?? raw.completion_tokens),
    cacheRead: num(raw.cacheRead ?? raw.cache_read ?? raw.cache_read_input_tokens),
    cacheWrite: num(raw.cacheWrite ?? raw.cache_write ?? raw.cache_creation_input_tokens),
    totalTokens: num(raw.totalTokens ?? raw.total_tokens),
    contextWindow: num(raw.context_window),
    durationMs: num(raw.request_duration_ms),
    cost: raw.cost && typeof raw.cost === 'object' ? raw.cost : null,
  };
}

/**
 * Locates <sessionsRoot>/YYYY/MM/DD/<HH-MM-SS>-<suffix>/ for one session id.
 * The on-disk suffix is `session_<base64(session id) without padding>`, so both forms are matched.
 */
function sessionIdSuffixes(sessionId) {
  const suffixes = [sessionId];
  try {
    suffixes.push(Buffer.from(sessionId, 'utf8').toString('base64').replace(/=+$/, ''));
  } catch {
    // non-UTF8 ids still match on the raw form
  }
  return suffixes;
}

async function findSessionDir(sessionsRoot, sessionId) {
  const suffixes = sessionIdSuffixes(sessionId);
  const years = await readdir(sessionsRoot).catch(() => []);
  for (const year of years) {
    const months = await readdir(path.join(sessionsRoot, year)).catch(() => []);
    for (const month of months) {
      const days = await readdir(path.join(sessionsRoot, year, month)).catch(() => []);
      for (const day of days) {
        const dayDir = path.join(sessionsRoot, year, month, day);
        const entries = await readdir(dayDir).catch(() => []);
        const hit = entries.find((name) => suffixes.some((suffix) => name.endsWith(suffix)));
        if (hit) return path.join(dayDir, hit);
      }
    }
  }
  return null;
}

async function sumSession(messagesPath) {
  const totals = {
    records: 0, turns: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0,
    totalTokens: 0, durationMs: 0, contextWindowMax: 0, unparsable: 0, anyCostNonZero: false,
    coldTurns: 0, coldInput: 0, firstColdInput: 0,
    models: [], providers: [],
  };
  const stream = createReadStream(messagesPath, { encoding: 'utf8' });
  const lines = readline.createInterface({ input: stream, crlfDelay: Infinity });
  for await (const line of lines) {
    const text = line.trim();
    if (!text) continue;
    totals.records += 1;
    let record;
    try {
      record = JSON.parse(text);
    } catch {
      totals.unparsable += 1;
      continue;
    }
    const model = record?.message?.model ?? record?.model;
    if (typeof model === 'string' && model && !totals.models.includes(model)) totals.models.push(model);
    const provider = record?.message?.provider ?? record?.provider;
    if (typeof provider === 'string' && provider && !totals.providers.includes(provider)) totals.providers.push(provider);
    const usage = readUsage(record);
    if (!usage) continue;
    totals.turns += 1;
    totals.input += usage.input;
    // Turn 1 is legitimately cold: no cache exists yet. Any *later* turn reporting no cache
    // read re-sent the whole context uncached. That is a provider-cache artifact, not work the
    // arm performed, and it inflates the fresh figure — counted here so the ledger shows it
    // rather than leaving it to be discovered by hand.
    if (totals.turns > 1 && usage.cacheRead === 0 && usage.input > 0) {
      if (totals.coldTurns === 0) totals.firstColdInput = usage.input;
      totals.coldTurns += 1;
      totals.coldInput += usage.input;
    }
    totals.output += usage.output;
    totals.cacheRead += usage.cacheRead;
    totals.cacheWrite += usage.cacheWrite;
    totals.totalTokens += usage.totalTokens || (usage.input + usage.cacheRead + usage.output);
    totals.durationMs += usage.durationMs;
    totals.contextWindowMax = Math.max(totals.contextWindowMax, usage.contextWindow);
    if (usage.cost && Object.values(usage.cost).some((value) => num(value) !== 0)) totals.anyCostNonZero = true;
  }
  return totals;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const dataDir = args.dataDir ?? process.env.MINIMAX_DATA_DIR ?? path.join(os.homedir(), '.minimax');
  const sessionsRoot = path.join(dataDir, 'v2', 'sessions');
  if (!existsSync(sessionsRoot)) throw new Error(`sessions root not found: ${sessionsRoot}`);

  let runs = args.runs;
  let meta = {};
  if (!runs.length) {
    const manifestPath = path.resolve(args.manifest ?? path.join(BENCH, 'results', 'runs.json'));
    if (!existsSync(manifestPath)) throw new Error(`manifest not found: ${manifestPath}`);
    const manifest = JSON.parse(await (await import('node:fs/promises')).readFile(manifestPath, 'utf8'));
    runs = manifest.runs ?? [];
    meta = { round: manifest.round, model: manifest.model, effort: manifest.effort, manifest: manifestPath };
  }

  const captured = [];
  for (const run of runs) {
    if (!run || !run.sessionId) throw new Error(`run is missing sessionId: ${JSON.stringify(run)}`);
    const sessionDir = await findSessionDir(sessionsRoot, run.sessionId);
    if (!sessionDir) {
      captured.push({ ...run, found: false, error: `session directory not found for ${run.sessionId}` });
      continue;
    }
    const messagesPath = path.join(sessionDir, 'messages.jsonl');
    if (!existsSync(messagesPath)) {
      captured.push({ ...run, found: false, sessionDir, error: `messages.jsonl not found in ${sessionDir}` });
      continue;
    }
    const totals = await sumSession(messagesPath);
    const fresh = totals.input + totals.output;
    captured.push({
      ...run,
      found: true,
      sessionDir,
      ...totals,
      fresh,
      cacheReadShare: totals.totalTokens > 0 ? Number((totals.cacheRead / totals.totalTokens).toFixed(4)) : 0,
      coldInputShare: totals.input > 0 ? Number((totals.coldInput / totals.input).toFixed(4)) : 0,
      // The earliest cold turn is the expected warm-up: every arm observed so far has exactly one
      // (turn 2), because no cache exists yet. Excess is what remains after it, so the artifact
      // warning fires only on arms that additionally lost the cache. Excluding that one turn
      // understates the artifact if an arm busts its cache without a warm-up cost first.
      excessColdTurns: Math.max(0, totals.coldTurns - 1),
      excessColdInput: Math.max(0, totals.coldInput - totals.firstColdInput),
      excessColdShare: totals.input > 0
        ? Number((Math.max(0, totals.coldInput - totals.firstColdInput) / totals.input).toFixed(4))
        : 0,
    });
  }

  const report = {
    tool: 'capture-tokens.mjs',
    generatedAt: new Date().toISOString(),
    dataDir,
    sessionsRoot,
    ...meta,
    runs: captured,
  };

  const out = path.resolve(args.out ?? path.join(BENCH, 'results', `tokens-${new Date().toISOString().slice(0, 10)}.json`));
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  for (const run of captured) {
    if (!run.found) {
      console.log(`${run.label ?? run.arm ?? run.sessionId}: NOT FOUND — ${run.error}`);
      continue;
    }
    console.log(
      `${(run.label ?? run.arm ?? run.sessionId).padEnd(12)} turns=${String(run.turns).padStart(3)} ` +
      `total=${String(run.totalTokens).padStart(9)} fresh=${String(run.fresh).padStart(7)} ` +
      `cacheRead=${String(run.cacheRead).padStart(9)} coldTurns=${String(run.coldTurns).padStart(3)} ` +
      `coldInput=${String(run.coldInput).padStart(8)}`,
    );
  }
  console.log(`\nwrote ${out}`);
}

await main();
