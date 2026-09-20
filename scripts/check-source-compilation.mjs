// Compiles generated consumer projects with their framework's own toolchain.
//
// check-source-distribution.mjs proves the CLI writes the right files; this proves
// those files survive the consumer's compiler and bundler. The distinction matters:
// a generated project that only type-checks is not evidence that it bundles, and a
// starter whose app never imports the generated source exercises neither.
//
// Each framework gets: create -> add --all -> probe import of every generated module
// -> install -> build. The probe is what forces the bundler to reach generated code,
// because the shipped starter app does not import it yet.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'dist', 'universal-cli', 'cli.mjs');
if (!fs.existsSync(cli)) {
  console.error('source:compile: dist/universal-cli/cli.mjs is missing. Run `pnpm source:build` first.');
  process.exit(1);
}

const argv = process.argv.slice(2);
const onlyIndex = argv.indexOf('--only');
const only = onlyIndex === -1 ? null : argv[onlyIndex + 1]?.split(',').filter(Boolean);
const keep = argv.includes('--keep');
const frameworks = only ?? ['react', 'vue', 'svelte', 'native'];

// Every framework is always built and reported. `verified` names the ones whose output
// is known to compile, and only those can fail this gate. A framework outside it is
// printed as UNVERIFIED on every run rather than skipped, so a red result can never be
// mistaken for a green one:
//   vue, svelte — pro-vue and pro-svelte data-table do not type-check. Those adapters
//   are owned by PRD 0006, which is why this list is short of the full set.
// Move a framework here the moment it compiles; never move one out to land a change.
const verified = ['react', 'native'];

const entryFor = (framework) => (framework === 'react' || framework === 'native' ? 'src/main.tsx' : 'src/main.ts');
const isWindows = process.platform === 'win32';
// Built from a code point so the source holds no literal control character.
const ansiEscape = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');
const run = (command, args, cwd) => {
  let executable = command;
  let commandArgs = args;
  if (isWindows && command === 'npm') {
    executable = process.env.ComSpec || 'cmd.exe';
    commandArgs = ['/d', '/s', '/c', 'npm', ...args];
  }
  return spawnSync(executable, commandArgs, { cwd, encoding: 'utf8', shell: false, timeout: 600000 });
};

/** Writes a module that side-effect-imports every generated file, so the bundler must reach it. */
const writeProbe = (projectDir, sourceDir, framework) => {
  const absolute = path.join(projectDir, sourceDir);
  const found = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(?:ts|tsx)$/.test(entry.name)) found.push(full);
    }
  };
  walk(absolute);
  assert.ok(found.length > 0, `No generated source under ${sourceDir}; the probe would prove nothing`);
  const importers = found
    .map((file) => './' + path.relative(path.join(projectDir, 'src'), file).replaceAll('\\', '/').replace(/\.(?:ts|tsx)$/, ''))
    .sort();
  fs.writeFileSync(path.join(projectDir, 'src', '__compile-probe.ts'), importers.map((specifier) => `import '${specifier}';`).join('\n') + '\n');
  const entry = path.join(projectDir, entryFor(framework));
  fs.appendFileSync(entry, `\nimport './__compile-probe';\n`);
  return importers.length;
};

const parent = path.join(root, '.source-test-tmp');
fs.mkdirSync(parent, { recursive: true });
const scratch = fs.mkdtempSync(path.join(parent, 'compile-'));
const results = [];
try {
  for (const framework of frameworks) {
    const cwd = path.join(scratch, framework);
    fs.mkdirSync(cwd, { recursive: true });
    const report = { framework, generated: 0, build: 'not run', detail: '' };
    results.push(report);
    try {
      const created = run(process.execPath, [cli, 'create', `compile-${framework}`, '--framework', framework, '--no-install'], cwd);
      assert.equal(created.status, 0, `create failed\n${created.stdout}\n${created.stderr}`);
      const projectDir = path.join(cwd, `compile-${framework}`);
      const added = run(process.execPath, [cli, 'add', '--all', '--framework', framework, '--no-install', '--cwd', projectDir], root);
      assert.equal(added.status, 0, `add --all failed\n${added.stdout}\n${added.stderr}`);
      const config = JSON.parse(fs.readFileSync(path.join(projectDir, 'universal.json'), 'utf8'));
      report.generated = writeProbe(projectDir, config.sourceDir, framework);
      const installed = run('npm', ['install', '--no-audit', '--no-fund'], projectDir);
      assert.equal(installed.status, 0, `npm install failed\n${installed.stdout}\n${installed.stderr}`);
      const built = run('npm', ['run', 'build'], projectDir);
      if (built.status === 0) {
        report.build = 'pass';
      } else {
        report.build = 'fail';
        report.detail = `${built.stdout ?? ''}${built.stderr ?? ''}`
          .split('\n')
          .map((line) => line.replace(ansiEscape, '').trimEnd())
          .filter((line) => line.trim() && !line.startsWith('>') && !line.startsWith('npm warn') && !/^\s*(transforming|rendering chunks|computing gzip size)\.\.\.$/.test(line) && !line.startsWith('✓'))
          .slice(0, 8)
          .join('\n      ');
      }
    } catch (error) {
      report.build = 'fail';
      report.detail = String(error.message).split('\n').slice(0, 6).join('\n      ');
    }
    const status = report.build === 'pass' ? 'PASS' : verified.includes(framework) ? 'FAIL' : 'UNVERIFIED';
    console.log(`${status} ${report.framework}: ${report.generated} generated modules compiled`);
    if (report.detail) console.log(`      ${report.detail}`);
  }

  const failed = results.filter((report) => report.build !== 'pass' && verified.includes(report.framework));
  const unverified = results.filter((report) => report.build !== 'pass' && !verified.includes(report.framework));
  if (unverified.length) {
    console.warn(`\nsource:compile: WARNING — ${unverified.map((report) => report.framework).join(', ')} do not compile and are not gated yet (see the \`verified\` list). This run is not evidence that they work.`);
  }
  if (failed.length) {
    console.error(`\nsource:compile: FAIL — ${failed.map((report) => report.framework).join(', ')} did not compile in a consumer project.`);
  } else {
    console.log(`\nsource:compile: PASS — ${results.length - unverified.length} of ${results.length} framework starters installed and built: ${results.filter((r) => r.build === 'pass').map((r) => r.framework).join(', ')}.`);
  }
  process.exitCode = failed.length ? 1 : 0;
} finally {
  if (!keep) fs.rmSync(scratch, { recursive: true, force: true });
  else console.log(`\nsource:compile: retained ${scratch}`);
}
