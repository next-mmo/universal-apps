import { spawnSync } from 'node:child_process';

/** ND_PYTHON is an executable path, never a shell command. No runtime is installed. */
export function findPython({ env = process.env, platform = process.platform, spawn = spawnSync } = {}) {
  const candidates = env.ND_PYTHON
    ? [[env.ND_PYTHON, []]]
    : platform === 'win32'
      ? [['py', ['-3']], ['python', []], ['python3', []]]
      : [['python3', []], ['python', []]];
  for (const [command, prefix] of candidates) {
    const probe = spawn(command, [...prefix, '-c',
      'import sys; print("ND_PYTHON_OK" if sys.version_info >= (3, 10) else "ND_PYTHON_TOO_OLD")'],
    { env, encoding: 'utf8', timeout: 5000, windowsHide: true, shell: false });
    if (!probe.error && probe.status === 0 && probe.stdout?.trim() === 'ND_PYTHON_OK') {
      return { command, prefix };
    }
  }
  throw new Error('ND requires Python 3.10+. Put Python on PATH or set ND_PYTHON to its executable path. Nothing was installed.');
}

/** Preserve the caller cwd, arguments, environment, and child exit status. */
export function runPython(script, args, options = {}) {
  const { env = process.env, cwd = process.cwd(), spawn = spawnSync,
    report = (message) => console.error(message) } = options;
  try {
    const { command, prefix } = findPython({ ...options, env, spawn });
    const result = spawn(command, [...prefix, script, ...args],
      { cwd, env, stdio: 'inherit', shell: false });
    if (result.error) throw result.error;
    if (result.signal) {
      report(`ND interrupted by ${result.signal}.`);
      return result.signal === 'SIGINT' ? 130 : result.signal === 'SIGTERM' ? 143 : 1;
    }
    return Number.isInteger(result.status) ? result.status : 1;
  } catch (error) {
    report(`ND: ${error instanceof Error ? error.message : String(error)}`);
    return 2;
  }
}
