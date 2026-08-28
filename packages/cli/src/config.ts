import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync, type SpawnSyncOptionsWithStringEncoding, type SpawnSyncReturns } from 'node:child_process';

const rootDir = path.resolve(import.meta.dirname, '..', '..', '..');

export interface TargetConfig {
  componentDir: string;
  templateDir: string;
  baseTemplate: string;
  package: string;
  docsDir: string;
  docsMeta: string;
  importRewrites: Record<string, string>;
}

export interface ScaffoldConfig {
  rootDir: string;
  targets: Record<string, TargetConfig>;
}

export async function loadConfig(): Promise<ScaffoldConfig> {
  const configPath = path.join(rootDir, 'scaffold.config.json');
  const raw = JSON.parse(await readFile(configPath, 'utf8')) as { targets?: Record<string, TargetConfig> };
  if (!raw.targets || Object.keys(raw.targets).length === 0) {
    throw new Error(`scaffold.config.json defines no targets`);
  }
  return { rootDir, targets: raw.targets };
}

export function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

/**
 * Runs pnpm with the given arguments. Windows resolves pnpm through a .cmd
 * shim, which requires shell mode; Node deprecates passing args together with
 * shell, so the command is joined into one string there. Arguments are
 * first-party constants, never user input.
 */
export function runPnpm(args: string[], options: SpawnSyncOptionsWithStringEncoding): SpawnSyncReturns<string> {
  return process.platform === 'win32'
    ? spawnSync(`pnpm ${args.join(' ')}`, { ...options, shell: true })
    : spawnSync('pnpm', args, options);
}
