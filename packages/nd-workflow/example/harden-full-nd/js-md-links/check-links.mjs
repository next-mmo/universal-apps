#!/usr/bin/env node
// check-links.mjs — deterministic Markdown relative-link checker.
//
// Node.js built-in modules only. No network access: external links are counted,
// never fetched. Exits 1 when broken links, policy violations, or unreadable
// files exist; exits 2 on usage/argument errors.
//
// Hardening summary (evidence in HARDENING.md):
// - `..` targets that resolve outside the root and absolute targets are rejected
//   BEFORE any filesystem access to the target.
// - `.git`, `node_modules`, `dist`, `build` are not walked; symlinks are never
//   followed (loop safety).
// - Per-file read cap (default 1 MiB) with an explicit skip note.
// - Unreadable candidates (permission errors, directories named `*.md`, races)
//   are reported errors, never crashes.
// - Output is fully sorted: files, issues, notes, errors, and summary counts.

import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const MAX_FILE_BYTES = 1024 * 1024; // 1 MiB
export const DEFAULT_SKIP_DIRS = Object.freeze(['.git', 'node_modules', 'dist', 'build']);

const MD_EXT = '.md';
const SCHEME_RE = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
const HEADING_RE = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/;
const FENCE_RE = /^\s{0,3}(`{3,}|~{3,})/;
const REF_DEF_RE = /^\s{0,3}\[[^\]]+\]:\s*(\S+)/;

export const USAGE = [
  'Usage: node check-links.mjs <root-directory>',
  '',
  'Walks <root-directory> for *.md files and verifies relative links and',
  'same-file #anchors. External links (http/https/mailto/other schemes) are',
  'counted but never fetched.',
  '',
  'Exit codes:',
  '  0  no broken links, violations, or errors',
  '  1  broken links, policy violations, or unreadable files',
  '  2  usage or argument error',
].join('\n');

// ---------------------------------------------------------------------------
// Markdown scanning
// ---------------------------------------------------------------------------

/** Approximate GitHub heading slug: lowercase, punctuation dropped, spaces -> `-`. */
export function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Collect heading slugs for one document, mirroring GitHub's duplicate numbering. */
export function headingSlugs(text) {
  const seen = new Map();
  const slugs = new Set();
  for (const line of text.split(/\r?\n/)) {
    const m = HEADING_RE.exec(line);
    if (!m) continue;
    const base = slugify(m[2]);
    if (!base) continue;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    slugs.add(count === 0 ? base : `${base}-${count}`);
  }
  return slugs;
}

/** Blank out inline-code spans so sample links are not parsed as real links. */
function stripInlineCode(line) {
  let out = '';
  let i = 0;
  while (i < line.length) {
    if (line[i] !== '`') {
      out += line[i];
      i += 1;
      continue;
    }
    let ticks = 1;
    while (line[i + ticks] === '`') ticks += 1;
    const marker = '`'.repeat(ticks);
    const end = line.indexOf(marker, i + ticks);
    if (end === -1) {
      out += line[i];
      i += 1;
      continue;
    }
    out += ' '.repeat(end + ticks - i);
    i = end + ticks;
  }
  return out;
}

/** Extract `[text](target)` / `![alt](target)` / `[label]: target` with line numbers. */
export function extractLinks(text) {
  const links = [];
  const lines = text.split(/\r?\n/);
  let fence = null;
  for (let i = 0; i < lines.length; i += 1) {
    const rawLine = lines[i];
    const fenceMatch = FENCE_RE.exec(rawLine);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (fence === null) fence = marker;
      else if (fence === marker) fence = null;
      continue;
    }
    if (fence !== null) continue;

    const line = stripInlineCode(rawLine);
    const refDef = REF_DEF_RE.exec(line);
    if (refDef) {
      links.push({ line: i + 1, target: refDef[1], syntax: 'reference' });
      continue;
    }

    let cursor = 0;
    for (;;) {
      const open = line.indexOf('](', cursor);
      if (open === -1) break;
      let depth = 0;
      let close = -1;
      for (let j = open + 2; j < line.length; j += 1) {
        const ch = line[j];
        if (ch === '\\') {
          j += 1;
          continue;
        }
        if (ch === '(') depth += 1;
        else if (ch === ')') {
          if (depth === 0) {
            close = j;
            break;
          }
          depth -= 1;
        }
      }
      if (close === -1) break;
      const inside = line.slice(open + 2, close).trim();
      const target = inside.split(/\s+/)[0] ?? '';
      if (target) {
        links.push({ line: i + 1, target, syntax: 'inline' });
      }
      cursor = close + 1;
    }
  }
  return links;
}

// ---------------------------------------------------------------------------
// Path policy
// ---------------------------------------------------------------------------

/** True when `candidate` is the root itself or lives inside it (case-aware on Windows). */
export function isInsideRoot(root, candidate) {
  const rel = path.relative(root, candidate);
  if (rel === '') return true;
  if (rel === '..') return false;
  if (rel.startsWith(`..${path.sep}`)) return false;
  return !path.isAbsolute(rel);
}

/** Normalize a raw markdown target into { pathPart, fragment } or an error string. */
export function splitTarget(rawTarget) {
  let target = rawTarget;
  if (target.startsWith('<') && target.endsWith('>') && target.length > 1) {
    target = target.slice(1, -1);
  }
  const hash = target.indexOf('#');
  let pathPart = hash === -1 ? target : target.slice(0, hash);
  const fragment = hash === -1 ? '' : target.slice(hash + 1);
  try {
    pathPart = decodeURIComponent(pathPart);
  } catch {
    return { error: 'invalid percent-encoding in target' };
  }
  return { pathPart, fragment };
}

/**
 * Classify a raw target before any filesystem access.
 *
 * Order matters: a Windows drive path (`C:\x`) also looks like a single-letter
 * URI scheme, so the drive/UNC rules run before the scheme rule; protocol-relative
 * URLs (`//host/x`) must not be mistaken for UNC paths.
 *
 * @returns {'anchor'|'external'|'absolute'|'relative'}
 */
export function classifyTarget(target) {
  if (target.startsWith('#')) return 'anchor';
  if (/^\/\/[^/\\]/.test(target)) return 'external'; // protocol-relative URL
  if (/^[a-zA-Z]:[\\/]/.test(target)) return 'absolute'; // Windows drive path
  if (/^\\\\/.test(target)) return 'absolute'; // UNC path
  if (SCHEME_RE.test(target)) return 'external'; // http:, https:, mailto:, ...
  if (path.isAbsolute(target)) return 'absolute'; // POSIX-style absolute path
  return 'relative';
}

function toDisplay(root, absPath) {
  return path.relative(root, absPath).split(path.sep).join('/');
}

function byKey(list, keyFn) {
  return list.sort((a, b) => {
    const ka = keyFn(a);
    const kb = keyFn(b);
    if (ka < kb) return -1;
    if (ka > kb) return 1;
    return 0;
  });
}

// ---------------------------------------------------------------------------
// Walker
// ---------------------------------------------------------------------------

async function collectMarkdownFiles(dir, io, skipDirs, out) {
  const entries = await io.readdir(dir, { withFileTypes: true });
  entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) continue; // never follow links: loop + escape safety
    if (entry.name.toLowerCase().endsWith(MD_EXT)) {
      // Files, and anomalous directories named `*.md`, become candidates; the
      // latter surface as unreadable-file errors instead of being silently skipped.
      out.push(full);
      continue;
    }
    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name)) continue;
      await collectMarkdownFiles(full, io, skipDirs, out);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Checker
// ---------------------------------------------------------------------------

/**
 * Check every *.md file under `root`.
 *
 * @param {string} root
 * @param {{fs?: object, skipDirs?: string[], maxFileBytes?: number}} [options]
 * @returns {Promise<object>} report (see README.md for the shape)
 */
export async function checkLinks(root, options = {}) {
  const io = options.fs ?? { readdir, readFile, stat };
  const skipDirs = new Set(options.skipDirs ?? DEFAULT_SKIP_DIRS);
  const maxFileBytes = options.maxFileBytes ?? MAX_FILE_BYTES;
  const absRoot = path.resolve(root);

  const report = {
    root: absRoot,
    files: [],
    skipped: [],
    issues: [],
    notes: [],
    errors: [],
    links: { total: 0, external: 0, anchorsChecked: 0 },
  };

  const candidates = await collectMarkdownFiles(absRoot, io, skipDirs, []);

  for (const filePath of candidates) {
    const rel = toDisplay(absRoot, filePath);

    let info;
    try {
      info = await io.stat(filePath);
    } catch (error) {
      report.errors.push({ path: rel, message: `unreadable: ${error.code ?? error.message}` });
      continue;
    }
    if (info.isDirectory()) {
      report.errors.push({ path: rel, message: 'unreadable: path is a directory, not a file' });
      continue;
    }
    if (!info.isFile()) {
      report.errors.push({ path: rel, message: 'unreadable: not a regular file' });
      continue;
    }
    if (info.size > maxFileBytes) {
      report.skipped.push({
        path: rel,
        bytes: info.size,
        reason: `size ${info.size} bytes exceeds cap ${maxFileBytes} bytes; not scanned`,
      });
      continue;
    }

    let text;
    try {
      text = await io.readFile(filePath, 'utf8');
    } catch (error) {
      report.errors.push({ path: rel, message: `unreadable: ${error.code ?? error.message}` });
      continue;
    }

    const links = extractLinks(text);
    const slugs = headingSlugs(text);
    const dir = path.dirname(filePath);
    report.files.push({ path: rel, bytes: info.size, links: links.length });
    report.links.total += links.length;

    for (const link of links) {
      const { target } = link;
      const classification = classifyTarget(target);
      if (classification === 'external') {
        report.links.external += 1; // counted, never fetched
        continue;
      }
      if (classification === 'absolute') {
        report.issues.push({
          path: rel,
          line: link.line,
          kind: 'violation',
          target,
          message: 'absolute path is not allowed',
        });
        continue; // never touched: no filesystem access to absolute targets
      }

      const split = splitTarget(target);
      if (split.error) {
        report.issues.push({
          path: rel,
          line: link.line,
          kind: 'broken',
          target,
          message: split.error,
        });
        continue;
      }
      const { pathPart, fragment } = split;

      if (pathPart === '') {
        report.links.anchorsChecked += 1;
        if (fragment && !slugs.has(fragment)) {
          report.issues.push({
            path: rel,
            line: link.line,
            kind: 'broken',
            target,
            message: `heading "#${fragment}" not found in this file`,
          });
        }
        continue;
      }

      const resolved = path.resolve(dir, pathPart);
      if (!isInsideRoot(absRoot, resolved)) {
        report.issues.push({
          path: rel,
          line: link.line,
          kind: 'violation',
          target,
          message: `path escapes root (resolved ${resolved})`,
        });
        continue; // never touch the filesystem outside the root
      }

      let targetInfo;
      try {
        targetInfo = await io.stat(resolved);
      } catch (error) {
        if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
          report.issues.push({
            path: rel,
            line: link.line,
            kind: 'broken',
            target,
            message: 'target does not exist',
          });
        } else {
          report.issues.push({
            path: rel,
            line: link.line,
            kind: 'error',
            target,
            message: `target not readable: ${error.code ?? error.message}`,
          });
        }
        continue;
      }
      if (!targetInfo.isFile() && !targetInfo.isDirectory()) {
        report.notes.push({
          path: rel,
          message: `line ${link.line}: target ${target} exists but is not a regular file or directory`,
        });
      }
      // Cross-file fragments are intentionally not verified; see HARDENING.md.
    }
  }

  byKey(report.files, (f) => f.path);
  byKey(report.skipped, (f) => f.path);
  byKey(report.errors, (f) => f.path + f.message);
  byKey(report.notes, (f) => f.path + f.message);
  byKey(report.issues, (i) => `${i.path}\u0000${String(i.line).padStart(6, '0')}\u0000${i.kind}\u0000${i.target}`);
  return report;
}

export function summarize(report) {
  const counts = { broken: 0, violation: 0, error: 0, note: report.notes.length };
  for (const issue of report.issues) {
    if (issue.kind === 'violation') counts.violation += 1;
    else if (issue.kind === 'error') counts.error += 1;
    else counts.broken += 1;
  }
  counts.error += report.errors.length;
  counts.failed = counts.broken + counts.violation + counts.error;
  return counts;
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

export function formatReport(report) {
  const counts = summarize(report);
  const lines = [];
  lines.push(`Root: ${report.root}`);
  lines.push(
    `Files: ${report.files.length} scanned, ${report.skipped.length} skipped | ` +
      `Links: ${report.links.total} (external: ${report.links.external}, ` +
      `same-file anchors checked: ${report.links.anchorsChecked})`,
  );

  if (report.issues.length > 0) {
    lines.push('', 'BROKEN');
    let current = null;
    for (const issue of report.issues) {
      if (issue.path !== current) {
        current = issue.path;
        lines.push(`  ${current}`);
      }
      lines.push(`    L${issue.line} [${issue.kind}] ${issue.target} -> ${issue.message}`);
    }
  }

  if (report.errors.length > 0) {
    lines.push('', 'ERRORS');
    for (const error of report.errors) lines.push(`  ${error.path} -> ${error.message}`);
  }

  if (report.skipped.length > 0) {
    lines.push('', 'SKIPPED');
    for (const skip of report.skipped) lines.push(`  ${skip.path} -> ${skip.reason}`);
  }

  if (report.notes.length > 0) {
    lines.push('', 'NOTES');
    for (const note of report.notes) lines.push(`  ${note.path} -> ${note.message}`);
  }

  lines.push(
    '',
    `Summary: ${counts.broken} broken, ${counts.violation} violations, ` +
      `${counts.error} errors, ${counts.note} notes`,
  );
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

export async function main(argv = process.argv.slice(2)) {
  if (argv.some((arg) => arg === '--help' || arg === '-h')) {
    console.log(USAGE);
    return 0;
  }
  const unknown = argv.find((arg) => arg.startsWith('-'));
  if (unknown) {
    console.error(`check-links: unknown option ${unknown}`);
    console.error(USAGE);
    return 2;
  }
  if (argv.length !== 1) {
    console.error(`check-links: expected exactly one root directory, got ${argv.length}`);
    console.error(USAGE);
    return 2;
  }

  const root = path.resolve(argv[0]);
  let info;
  try {
    info = await stat(root);
  } catch (error) {
    console.error(`check-links: cannot access root ${root}: ${error.code ?? error.message}`);
    return 2;
  }
  if (!info.isDirectory()) {
    console.error(`check-links: root is not a directory: ${root}`);
    return 2;
  }

  const report = await checkLinks(root);
  console.log(formatReport(report));
  const counts = summarize(report);
  if (counts.failed > 0) {
    console.error(`check-links: FAILED with ${counts.failed} problem(s) under ${root}`);
    return 1;
  }
  console.log(`check-links: OK under ${root}`);
  return 0;
}

const invokedDirectly =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (invokedDirectly || process.argv[1] === pathToFileURL(fileURLToPath(import.meta.url)).pathname) {
  process.exitCode = await main();
}
