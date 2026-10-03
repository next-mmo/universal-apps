// Smoke tests for the kb-workflow scaffold installer (init.mjs) and the
// shipped skill/template inventory. Uses the Node built-in test runner so the
// package stays dependency-free.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { access, mkdir, mkdtemp, readdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const init = path.join(packageRoot, 'init.mjs');

const scratch = () => mkdtemp(path.join(tmpdir(), 'kb-workflow-'));

async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

test('preview mode prints the plan and creates nothing', async () => {
  const target = await scratch();
  const { stdout } = await run(process.execPath, [init, target]);
  assert.match(stdout, /\d+ file\(s\) to create/);
  assert.match(stdout, /Preview only/);
  assert.deepEqual(await readdir(target), []);
});

test('--write materializes the scaffold, re-running keeps existing files', async () => {
  const target = await scratch();
  const first = await run(process.execPath, [init, target, '--write']);
  assert.match(first.stdout, /Wrote \d+ file\(s\)/);
  const shipped = ['AGENTS.md', '.agents/docs/WORKFLOW.md', '.agents/templates/PRD.md', 'docs/README.md', 'docs/prd/.gitkeep'];
  for (const relative of shipped)
    await access(path.join(target, ...relative.split('/')));
  const artifacts = (await walk(target)).filter((file) => file.endsWith('.pyc'));
  assert.deepEqual(artifacts, [], 'build artifacts must not ship in the scaffold');
  const second = await run(process.execPath, [init, target, '--write']);
  assert.match(second.stdout, /0 file\(s\) to create/);
  assert.match(second.stdout, /Wrote 0 file\(s\)/);
});

test('a directory occupying a file path is reported as a conflict', async () => {
  const target = await scratch();
  await mkdir(path.join(target, 'AGENTS.md'));
  await assert.rejects(run(process.execPath, [init, target]), (error) => {
    assert.equal(error.code, 1);
    assert.match(error.stdout, /conflict/);
    return true;
  });
});

test('missing target prints usage and exits with code 2', async () => {
  await assert.rejects(run(process.execPath, [init]), (error) => {
    assert.equal(error.code, 2);
    assert.match(error.stderr, /Usage/);
    return true;
  });
});

test('every shipped skill and template is intact', async () => {
  const skillsDir = path.join(packageRoot, '.agents', 'skills');
  const skills = (await readdir(skillsDir, { withFileTypes: true })).filter((entry) => entry.isDirectory());
  assert.equal(skills.length, 9);
  for (const skill of skills) {
    const text = await readFile(path.join(skillsDir, skill.name, 'SKILL.md'), 'utf8');
    assert.match(text, /^name: kb-/m, `${skill.name}/SKILL.md must name its skill`);
    assert.match(text, /^description: /m, `${skill.name}/SKILL.md must describe its trigger`);
  }
  const templates = await readdir(path.join(packageRoot, '.agents', 'templates'));
  for (const template of ['PRD.md', 'TASK.md'])
    assert.ok(templates.includes(template), `${template} template is missing`);
});
