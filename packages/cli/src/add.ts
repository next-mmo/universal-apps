import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import type { ScaffoldConfig, TargetConfig } from './config';
import { fail } from './config';
import { externalDependencies, transformImports } from './transform';

const KEbabPattern = /^[a-z][a-z0-9-]*$/;

export function toPascalCase(kebab: string): string {
  return kebab
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

async function exists(file: string): Promise<boolean> {
  return access(file)
    .then(() => true)
    .catch(() => false);
}

async function installDependencies(target: TargetConfig, config: ScaffoldConfig, deps: string[]): Promise<void> {
  const command = `pnpm --filter ${target.package} add ${deps.join(' ')}`;
  console.log(`\ninstalling dependencies:\n  ${command}`);
  const result = spawnSync('pnpm', ['--filter', target.package, 'add', ...deps], {
    cwd: config.rootDir,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    console.error(`dependency install failed — run the command above manually.`);
  }
}

async function writeDocsStub(config: ScaffoldConfig, target: TargetConfig, kebab: string, pascal: string): Promise<void> {
  const docsPath = path.join(config.rootDir, target.docsDir, `${kebab}.mdx`);
  if (await exists(docsPath)) {
    console.log(`docs page already exists, skipping: ${target.docsDir}/${kebab}.mdx`);
    return;
  }
  const description = `${pascal} component placeholder — replace this description once the component is ported.`;
  const mdx = `---
title: ${pascal}
description: ${description}
---

${pascal} is scaffolded but not yet ported. Paste the canonical shadcn/ui source into \`packages/ui/src/components/ui/${kebab}.tsx\`, then fill in this page.

## Import

\`\`\`ts
import { ${pascal} } from '@package/ui/src/components/ui/${kebab}';
\`\`\`

## Usage

\`\`\`tsx
<${pascal} />
\`\`\`

## API

Document the component's props here.
`;
  await mkdir(path.dirname(docsPath), { recursive: true });
  await writeFile(docsPath, mdx, 'utf8');
  console.log(`docs stub: ${target.docsDir}/${kebab}.mdx`);

  await spliceMeta(config, target, kebab);
}

async function spliceMeta(config: ScaffoldConfig, target: TargetConfig, kebab: string): Promise<void> {
  const metaPath = path.join(config.rootDir, target.docsMeta);
  const meta = JSON.parse(await readFile(metaPath, 'utf8')) as { pages: string[] };
  if (meta.pages.includes(kebab)) return;
  meta.pages = [...meta.pages, kebab].sort();
  await writeFile(metaPath, `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
  console.log(`sidebar: added "${kebab}" to ${target.docsMeta}`);
}

/** `add ui <name>` — resolve template → transform imports → write → install deps → docs wiring. */
export async function add(config: ScaffoldConfig, args: string[]): Promise<void> {
  const [targetName, componentName] = args;
  const target = config.targets[targetName];
  if (!target) {
    fail(`unknown target "${targetName ?? ''}". Available: ${Object.keys(config.targets).join(', ')}`);
  }
  if (!componentName) {
    fail(`missing component name. Usage: scaffold add ${targetName} <kebab-name>`);
  }
  if (!KEbabPattern.test(componentName)) {
    fail(`component name must be kebab-case (a-z, 0-9, -), got "${componentName}"`);
  }

  const pascal = toPascalCase(componentName);
  const componentPath = path.join(config.rootDir, target.componentDir, `${componentName}.tsx`);
  if (await exists(componentPath)) {
    fail(`component already exists: ${path.relative(config.rootDir, componentPath)}`);
  }

  const specificTemplate = path.join(config.rootDir, target.templateDir, `${componentName}.tsx`);
  const baseTemplate = path.join(config.rootDir, target.templateDir, target.baseTemplate);
  const templatePath = (await exists(specificTemplate)) ? specificTemplate : baseTemplate;
  const usingBase = templatePath === baseTemplate;
  console.log(`template: ${path.relative(config.rootDir, templatePath)}${usingBase ? ' (base placeholder)' : ''}`);

  const raw = await readFile(templatePath, 'utf8');
  const transformed = transformImports(raw, target.importRewrites);

  await mkdir(path.dirname(componentPath), { recursive: true });
  await writeFile(componentPath, transformed, 'utf8');
  console.log(`component: ${path.relative(config.rootDir, componentPath)}`);

  const deps = externalDependencies(transformed);
  if (deps.length > 0) {
    await installDependencies(target, config, deps);
  }

  await writeDocsStub(config, target, componentName, pascal);

  console.log(`
done. next steps:
  1. port the real ${pascal} implementation into ${target.componentDir}/${componentName}.tsx
  2. restart \`pnpm dev\` so fumadocs typegen picks up the new docs page
  3. refresh llms.txt with \`pnpm --filter @app/tauri-app exec tsx scripts/generate-llm.ts\`
`);
}

/** `list` — templates available per target vs. components already installed. */
export async function list(config: ScaffoldConfig): Promise<void> {
  for (const [targetName, target] of Object.entries(config.targets)) {
    console.log(`${targetName}:`);
    const templates = (await readdir(path.join(config.rootDir, target.templateDir)))
      .filter((file) => file.endsWith('.tsx') && file !== target.baseTemplate)
      .map((file) => file.replace(/\.tsx$/, ''))
      .sort();
    const installed = new Set(
      (await readdir(path.join(config.rootDir, target.componentDir)))
        .filter((file) => file.endsWith('.tsx'))
        .map((file) => file.replace(/\.tsx$/, '')),
    );
    for (const template of templates) {
      console.log(`  ${template}${installed.has(template) ? '  (installed)' : ''}`);
    }
    const baseAvailable = `  <any-name>  via ${target.baseTemplate} base template`;
    console.log(baseAvailable);
  }
}
