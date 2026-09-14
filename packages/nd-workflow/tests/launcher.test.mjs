import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findPython, runPython } from '../scripts/python-launcher.mjs';

const found = { status: 0, stdout: 'ND_PYTHON_OK\n' };

test('explicit Python path is one argument and never falls back silently', () => {
  const calls = [];
  const env = { ND_PYTHON: '/path with spaces/python;literal' };
  const result = findPython({ env, spawn: (...args) => { calls.push(args); return found; } });
  assert.equal(result.command, env.ND_PYTHON);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][2].shell, false);
  assert.throws(() => findPython({ env, spawn: () => ({ error: new Error('missing') }) }), /Python 3.10/);
});

test('Windows launcher supports py -3 and rejects old Python', () => {
  const calls = [];
  const result = findPython({ env: {}, platform: 'win32', spawn: (...args) => {
    calls.push(args);
    return calls.length === 1 ? { status: 0, stdout: 'ND_PYTHON_TOO_OLD' } : found;
  } });
  assert.equal(calls[0][0], 'py');
  assert.equal(calls[0][1][0], '-3');
  assert.equal(result.command, 'python');
});

test('cwd, env, literal arguments, and failing child status are preserved', () => {
  const calls = [];
  const env = { ND_PYTHON: '/python' };
  const code = runPython('/standalone/scripts/nd.py', ['task', 'a; literal title', '--target', 'a b'], {
    env, cwd: '/unrelated-project', spawn: (...args) => {
      calls.push(args); return calls.length === 1 ? found : { status: 7 };
    },
  });
  assert.equal(code, 7);
  assert.deepEqual(calls[1][1], ['/standalone/scripts/nd.py', 'task', 'a; literal title', '--target', 'a b']);
  assert.equal(calls[1][2].cwd, '/unrelated-project');
  assert.equal(calls[1][2].env, env);
  assert.equal(calls[1][2].shell, false);
});

test('missing Python is actionable and does not execute a project command', () => {
  const messages = [];
  let count = 0;
  assert.equal(runPython('/nd.py', ['check'], {
    env: { ND_PYTHON: '/missing' }, spawn: () => { count++; return { error: new Error('ENOENT') }; },
    report: (message) => messages.push(message),
  }), 2);
  assert.equal(count, 1);
  assert.match(messages[0], /Nothing was installed/);
});

test('signals and spawn failures cannot turn into successful checks', () => {
  for (const [result, expected] of [[{ signal: 'SIGINT' }, 130], [{ signal: 'SIGTERM' }, 143],
    [{ error: new Error('spawn failed') }, 2], [{ status: null }, 1]]) {
    let count = 0;
    assert.equal(runPython('/nd.py', [], {
      env: { ND_PYTHON: '/python' }, spawn: () => ++count === 1 ? found : result, report: () => {},
    }), expected);
  }
});
