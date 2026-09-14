// Tests for check-links.mjs — `node --test`, Node built-ins only, no network.
//
// Every fixture is created under the OS temp directory (mkdtemp) and removed in
// the after() hook. Nothing outside the temp root is created or modified.

import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import * as fsp from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import {
  checkLinks,
  extractLinks,
  formatReport,
  headingSlugs,
  isInsideRoot,
  slugify,
} from '../check-links.mjs';

const execFileAsync = promisify(execFile);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.join(HERE, '..', 'check-links.mjs');

const tempRoots = [];
after(async () => {
  for (const dir of tempRoots) {
    await rm(dir, { recursive: true, force: true });
  }
});

async function makeFixture(files) {
  const dir = await mkdtemp(path.join(tmpdir(), 'md-links-'));
  tempRoots.push(dir);
  for (const [relPath, content] of Object.entries(files)) {
    const full = path.join(dir, ...relPath.split('/'));
    await mkdir(path.dirname(full), { recursive: true });
    if (content === null) {
      await mkdir(full, { recursive: true }); // directory named like a markdown file
    } else {
      await writeFile(full, content, 'utf8');
    }
  }
  return dir;
}

async function runCli(args) {
  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, [CLI, ...args], {
      encoding: 'utf8',
      cwd: HERE,
    });
    return { code: 0, stdout, stderr };
  } catch (error) {
    return { code: error.code, stdout: error.stdout ?? '', stderr: error.stderr ?? '' };
  }
}

// ---------------------------------------------------------------------------
// Core behavior
// ---------------------------------------------------------------------------

test('clean fixture: no issues, external links counted, CLI exits 0', async () => {
  const root = await makeFixture({
    'README.md': [
      '# Root',
      '',
      'See [guide](docs/guide.md) and [site](https://example.com).',
      'Mail [team](mailto:team@example.com).',
      '',
    ].join('\n'),
    'docs/guide.md': '# Guide\n\nBack to [root](../README.md). Should stay inside\n',
  });
  const report = await checkLinks(root);
  assert.equal(report.issues.length, 0);
  assert.equal(report.errors.length, 0);
  assert.equal(report.files.length, 2);
  assert.equal(report.links.external, 2);

  const cli = await runCli([root]);
  assert.equal(cli.code, 0);
  assert.match(cli.stdout, /Summary: 0 broken, 0 violations, 0 errors, 0 notes/);
  assert.match(cli.stdout, /check-links: OK under /);
});

test('broken relative link is reported grouped by file and CLI exits 1', async () => {
  const root = await makeFixture({
    'clean.md': '# Clean\n\n[ok](fine.md)\n',
    'fine.md': '# Fine\n',
    'docs/b.md': '# B\n\n[bad](../missing.md)\n',
  });
  const report = await checkLinks(root);
  assert.equal(report.issues.length, 1);
  assert.deepEqual(
    { path: report.issues[0].path, line: report.issues[0].line, kind: report.issues[0].kind },
    { path: 'docs/b.md', line: 3, kind: 'broken' },
  );

  const cli = await runCli([root]);
  assert.equal(cli.code, 1);
  assert.match(
    cli.stdout,
    /BROKEN\n {2}docs\/b\.md\n {4}L3 \[broken\] \.\.\/missing\.md -> target does not exist/,
  );
  assert.match(cli.stderr, /check-links: FAILED with 1 problem\(s\)/);
});

test('traversal outside root is a violation and the outside path is never touched', async () => {
  const root = await makeFixture({
    'docs/note.md': '# Note\n\n[escape](../../secret.md)\n',
  });
  const outside = path.join(path.dirname(root), 'secret.md');
  const touched = [];
  const spyFs = {
    readdir: (...args) => fsp.readdir(...args),
    readFile: (...args) => fsp.readFile(...args),
    stat: (target, ...rest) => {
      touched.push(path.resolve(String(target)));
      return fsp.stat(target, ...rest);
    },
  };

  const report = await checkLinks(root, { fs: spyFs });
  assert.equal(report.issues.length, 1);
  assert.equal(report.issues[0].kind, 'violation');
  assert.match(report.issues[0].message, /path escapes root/);
  assert.equal(report.errors.length, 0, 'violation must not be reported as an error');
  assert.ok(
    touched.every((p) => p === root || p.startsWith(root + path.sep)),
    `only root-internal stat calls expected, saw: ${touched.join(', ')}`,
  );
  assert.ok(!touched.includes(outside), 'outside target must never be stat-ed');
});

test('absolute path target is a violation and is never touched', async () => {
  const root = await makeFixture({
    'a.md': '# A\n\n[posix](/etc/passwd)\n[win](C:\\Windows\\win.ini)\n',
  });
  const touched = [];
  const spyFs = {
    readdir: (...args) => fsp.readdir(...args),
    readFile: (...args) => fsp.readFile(...args),
    stat: (target, ...rest) => {
      touched.push(path.resolve(String(target)));
      return fsp.stat(target, ...rest);
    },
  };
  const report = await checkLinks(root, { fs: spyFs });
  assert.equal(report.issues.length, 2);
  for (const issue of report.issues) {
    assert.equal(issue.kind, 'violation');
    assert.equal(issue.message, 'absolute path is not allowed');
  }
  assert.ok(touched.every((p) => p.startsWith(root)), 'only root-internal stat calls expected');
});

test('skipped directories are not walked', async () => {
  const files = {};
  for (const dir of ['.git', 'node_modules', 'dist', 'build']) {
    files[`${dir}/deep/broken.md`] = '# X\n\n[nope](does-not-exist.md)\n';
  }
  files['keep.md'] = '# Keep\n\n[other](ok.md)\n[other-ref](ok.md)\n';
  files['ok.md'] = '# Ok\n';
  const root = await makeFixture(files);
  const report = await checkLinks(root);
  assert.deepEqual(report.files.map((f) => f.path), ['keep.md', 'ok.md']);
  assert.equal(report.issues.length, 0);
  const cli = await runCli([root]);
  assert.equal(cli.code, 0);
});

test('oversized file is skipped with an explicit note', async () => {
  const big = `# Big\n\n[bad](missing.md)\n${'x'.repeat(4096)}\n`;
  const root = await makeFixture({ 'big.md': big, 'small.md': '# Small\n' });
  const report = await checkLinks(root, { maxFileBytes: 1024 });
  assert.equal(report.skipped.length, 1);
  assert.equal(report.skipped[0].path, 'big.md');
  assert.equal(report.skipped[0].bytes, Buffer.byteLength(big));
  assert.equal(report.issues.length, 0, 'skipped file must not contribute issues');
  assert.deepEqual(report.files.map((f) => f.path), ['small.md']);

  const cli = await runCli([root]);
  assert.equal(cli.code, 1, 'with the default 1 MiB cap the file is scanned and its link is broken');
  assert.match(cli.stdout, /L3 \[broken\] missing\.md -> target does not exist/);
  assert.doesNotMatch(cli.stdout, /SKIPPED/);

  const grouped = formatReport(report);
  assert.match(grouped, /SKIPPED\n {2}big\.md -> size \d+ bytes exceeds cap 1024 bytes; not scanned/);
});

test('directory named *.md is reported as an unreadable error, not a crash', async () => {
  const root = await makeFixture({ 'blocked.md': null, 'ok.md': '# Ok\n' });
  const report = await checkLinks(root);
  assert.equal(report.errors.length, 1);
  assert.equal(report.errors[0].path, 'blocked.md');
  assert.match(report.errors[0].message, /unreadable: path is a directory, not a file/);

  const cli = await runCli([root]);
  assert.equal(cli.code, 1);
  assert.match(cli.stdout, /ERRORS\n {2}blocked\.md -> unreadable: path is a directory, not a file/);
  assert.match(cli.stdout, /Summary: 0 broken, 0 violations, 1 errors, 0 notes/);
});

test('injected read failure (EACCES) is reported as an unreadable error', async () => {
  const root = await makeFixture({ 'locked.md': '# Locked\n\n[bad](missing.md)\n' });
  const denied = Object.assign(new Error('EACCES: permission denied, open'), { code: 'EACCES' });
  const io = {
    readdir: (...args) => fsp.readdir(...args),
    stat: (...args) => fsp.stat(...args),
    readFile: async (target, ...rest) => {
      if (String(target).endsWith('locked.md')) throw denied;
      return fsp.readFile(target, ...rest);
    },
  };
  const report = await checkLinks(root, { fs: io });
  assert.equal(report.errors.length, 1);
  assert.equal(report.errors[0].message, 'unreadable: EACCES');
  assert.equal(report.issues.length, 0, 'unreadable file contributes no link issues');
  assert.equal(report.files.length, 0);
});

test('same-file anchor links verify headings when present', async () => {
  const root = await makeFixture({
    'doc.md': [
      '# Title',
      '',
      '[ok](#usage-notes)',
      '[punctuation](#whats-new)',
      '[empty](#)',
      '',
      '## Usage Notes',
      '',
      "## What's New?",
      '',
    ].join('\n'),
  });
  const report = await checkLinks(root);
  assert.equal(report.issues.length, 0);
  assert.equal(report.links.anchorsChecked, 3);
});

test('missing same-file anchor is reported as broken', async () => {
  const root = await makeFixture({
    'doc.md': '# Title\n\n[nope](#does-not-exist)\n\n## Other\n',
  });
  const report = await checkLinks(root);
  assert.equal(report.issues.length, 1);
  assert.equal(report.issues[0].kind, 'broken');
  assert.equal(report.issues[0].line, 3);
  assert.match(report.issues[0].message, /heading "#does-not-exist" not found in this file/);

  const cli = await runCli([root]);
  assert.equal(cli.code, 1);
});

test('external links are counted but never checked', async () => {
  const root = await makeFixture({
    'links.md': [
      '# Links',
      '',
      '[a](https://nonexistent.invalid/one)',
      '[b](http://nonexistent.invalid/two)',
      '[c](mailto:nobody@nonexistent.invalid)',
      '[d](ftp://nonexistent.invalid/three)',
      '[e](//cdn.nonexistent.invalid/four)',
      '',
    ].join('\n'),
  });
  const report = await checkLinks(root);
  assert.equal(report.links.total, 5);
  assert.equal(report.links.external, 5);
  assert.equal(report.issues.length, 0);
  const cli = await runCli([root]);
  assert.equal(cli.code, 0);
  assert.match(cli.stdout, /Links: 5 \(external: 5, same-file anchors checked: 0\)/);
});

test('usage errors exit 2 and --help exits 0', async () => {
  const noArgs = await runCli([]);
  assert.equal(noArgs.code, 2);
  assert.match(noArgs.stderr, /expected exactly one root directory, got 0/);

  const unknown = await runCli(['--wat']);
  assert.equal(unknown.code, 2);
  assert.match(unknown.stderr, /unknown option --wat/);

  const missingRoot = await runCli([path.join(tmpdir(), 'md-links-does-not-exist-xyz')]);
  assert.equal(missingRoot.code, 2);
  assert.match(missingRoot.stderr, /cannot access root /);

  const root = await makeFixture({ 'a.md': '# A\n' });
  const extra = await runCli([root, root]);
  assert.equal(extra.code, 2);
  assert.match(extra.stderr, /expected exactly one root directory, got 2/);

  const help = await runCli(['--help']);
  assert.equal(help.code, 0);
  assert.match(help.stdout, /^Usage: node check-links\.mjs <root-directory>/);
});

test('output is deterministic: files and issues are sorted', async () => {
  const root = await makeFixture({
    'b.md': '# B\n\n[z](missing-z.md)\n[a](missing-a.md)\n',
    'a.md': '# A\n\n[one](missing-one.md)\n',
    'c/inner.md': '# Inner\n\n[broke](nope.md)\n',
  });
  const first = await runCli([root]);
  const second = await runCli([root]);
  assert.equal(first.code, 1);
  assert.equal(first.stdout, second.stdout, 'two runs must produce byte-identical output');
  const order = [...first.stdout.matchAll(/^ {2}(\S+\.md)$/gm)].map((m) => m[1]);
  assert.deepEqual(order, ['a.md', 'b.md', 'c/inner.md']);
  const lineOrder = [...first.stdout.matchAll(/L(\d+) \[broken\] (\S+)/g)].map((m) => m[2]);
  assert.deepEqual(lineOrder, ['missing-one.md', 'missing-z.md', 'missing-a.md', 'nope.md']);
});

test('fenced code, inline code, and reference definitions are handled', async () => {
  const root = await makeFixture({
    'doc.md': [
      '# Doc',
      '',
      '```js',
      '[fenced](missing-in-fence.md)',
      '```',
      '',
      'Inline `[inline](missing-inline.md)` stays code.',
      '',
      '[ref]: real.md',
      '[dead]: gone.md',
      '',
      '[see][ref]',
      '',
    ].join('\n'),
    'real.md': '# Real\n',
  });
  const report = await checkLinks(root);
  assert.deepEqual(report.issues.map((i) => i.target), ['gone.md']);
  assert.equal(report.links.total, 2, 'only the two reference definitions are links');
});

test('extractLinks reports line numbers and parses inline, image, title, and paren targets', async () => {
  const text = [
    '# T',
    '',
    '![img](assets/pic.png)',
    '[title](docs/page.md "The Title")',
    '[nested](docs/v(1).md)',
    '[ref]: ../shared/target.md',
    '',
  ].join('\n');
  assert.deepEqual(extractLinks(text), [
    { line: 3, target: 'assets/pic.png', syntax: 'inline' },
    { line: 4, target: 'docs/page.md', syntax: 'inline' },
    { line: 5, target: 'docs/v(1).md', syntax: 'inline' },
    { line: 6, target: '../shared/target.md', syntax: 'reference' },
  ]);
});

test('headingSlugs approximates GitHub slugs and numbers duplicates', async () => {
  const text = ['# Hello, World!', '## `code` heading', '## Dup', '## Dup', '### dup', ''].join('\n');
  const slugs = headingSlugs(text);
  assert.equal(slugify('Hello, World!'), 'hello-world');
  assert.ok(slugs.has('hello-world'));
  assert.ok(slugs.has('code-heading'));
  assert.ok(slugs.has('dup'));
  assert.ok(slugs.has('dup-1'));
  assert.ok(slugs.has('dup-2'));
});

test('isInsideRoot rejects siblings with a shared path prefix', async () => {
  const root = path.join(tmpdir(), 'md-links-root');
  assert.equal(isInsideRoot(root, path.join(root, 'a.md')), true);
  assert.equal(isInsideRoot(root, root), true);
  assert.equal(isInsideRoot(root, `${root}-sibling/a.md`), false);
  assert.equal(isInsideRoot(root, path.join(root, '..', 'outside.md')), false);
  assert.equal(isInsideRoot(root, path.dirname(root)), false);
});

test('CLI smoke: report text is printed from a fixture in a temp directory', async () => {
  const root = await makeFixture({
    'README.md': '# Readme\n\n[guide](docs/guide.md)\n[gone](gone.md)\n',
    'docs/guide.md': '# Guide\n\n[up](../README.md)\n[out](../../escape.md)\n',
  });
  const cli = await runCli([root]);
  assert.equal(cli.code, 1);
  assert.equal(cli.stderr.trim(), `check-links: FAILED with 2 problem(s) under ${root}`);
  assert.match(cli.stdout, new RegExp(`^Root: ${root.replace(/\\/g, '\\\\')}$`, 'm'));
  assert.match(cli.stdout, /Summary: 1 broken, 1 violations, 0 errors, 0 notes/);
});

// Keep a direct read of one fixture file to prove tests do not mutate sources.
test('fixtures are readable and rows stay untouched after a run', async () => {
  const root = await makeFixture({ 'a.md': '# A\n\n[bad](nope.md)\n' });
  const before = await readFile(path.join(root, 'a.md'), 'utf8');
  await checkLinks(root);
  const afterRun = await readFile(path.join(root, 'a.md'), 'utf8');
  assert.equal(afterRun, before);
});
