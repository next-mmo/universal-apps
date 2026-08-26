import { readFile } from 'node:fs/promises';
import path from 'node:path';

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
