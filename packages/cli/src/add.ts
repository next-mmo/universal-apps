import { access, mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';

import type { ScaffoldConfig, TargetConfig } from './config';
import { fail, runPnpm } from './config';
import { externalDependencies, transformImports } from './transform';

const kebabPattern = /^[a-z][a-z0-9-]*$/;

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

async function installDependencies(
  target: TargetConfig,
  config: ScaffoldConfig,
  deps: string[],
  quiet: boolean,
): Promise<void> {
  const command = `pnpm --filter ${target.package} add ${deps.join(' ')}`;
  if (!quiet) console.log(`installing dependencies: ${command}`);
  const result = runPnpm(['--filter', target.package, 'add', ...deps], {
    cwd: config.rootDir,
    encoding: 'utf8',
    stdio: quiet ? 'pipe' : 'inherit',
  });
  if (result.status !== 0) {
    const detail = quiet ? `\n${result.stderr.trim()}` : '';
    throw new Error(`dependency installation failed: ${command}${detail}`);
  }
}

function docsStub(target: TargetConfig, kebab: string, pascal: string, placeholder: boolean): string {
  const importPath = `${target.package}/src/components/ui/${kebab}`;
  const state = placeholder
    ? `${pascal} is an explicit placeholder. Replace it with a complete implementation before use.`
    : `${pascal} was installed from the repository's vendored, dependency-aware template.`;
  return `---
title: ${pascal}
description: ${pascal} component for ${target.package}.
---

${state}

## Import

\`\`\`ts
import { ${pascal} } from '${importPath}';
\`\`\`

## Usage

\`\`\`tsx
<${pascal} />
\`\`\`

## API

Read the exported TypeScript props from \`${target.componentDir}/${kebab}.tsx\`.
`;
}

interface AddPlan {
  status: 'create' | 'unchanged';
  target: string;
  name: string;
  template?: string;
  component: string;
  docs: string;
  dependencies: string[];
  placeholder: boolean;
  installDependencies: boolean;
}

function printPlan(plan: AddPlan, json: boolean): void {
  if (json) {
    console.log(JSON.stringify(plan));
    return;
  }
  if (plan.status === 'unchanged') {
    console.log(`UNCHANGED ${plan.component}`);
    return;
  }
  console.log(`CREATE ${plan.component}`);
  console.log(`CREATE ${plan.docs}`);
  console.log(`TEMPLATE ${plan.template}`);
  if (plan.dependencies.length > 0) {
    console.log(`${plan.installDependencies ? 'INSTALL' : 'REQUIRES'} ${plan.dependencies.join(' ')}`);
  }
  if (plan.placeholder) console.log('PLACEHOLDER explicitly allowed; implementation is not production-ready');
}

/** Plans and applies one complete component template plus its documentation wiring. */
export async function add(config: ScaffoldConfig, args: string[]): Promise<void> {
  const { positionals, values } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      'dry-run': { type: 'boolean', default: false },
      'allow-placeholder': { type: 'boolean', default: false },
      'no-install': { type: 'boolean', default: false },
      json: { type: 'boolean', default: false },
    },
  });
  const [targetName, componentName] = positionals;
  const target = targetName === undefined ? undefined : config.targets[targetName];
  if (target === undefined) {
    fail(`unknown target "${targetName ?? ''}". Available: ${Object.keys(config.targets).join(', ')}`);
  }
  if (componentName === undefined) {
    fail(`missing component name. Usage: scaffold add ${targetName} <kebab-name>`);
  }
  if (!kebabPattern.test(componentName)) {
    fail(`component name must be kebab-case (a-z, 0-9, -), got "${componentName}"`);
  }

  const pascal = toPascalCase(componentName);
  const componentPath = path.join(config.rootDir, target.componentDir, `${componentName}.tsx`);
  const docsPath = path.join(config.rootDir, target.docsDir, `${componentName}.mdx`);
  const relativeComponent = path.relative(config.rootDir, componentPath).replaceAll('\\', '/');
  const relativeDocs = path.relative(config.rootDir, docsPath).replaceAll('\\', '/');
  if (await exists(componentPath)) {
    printPlan(
      {
        status: 'unchanged',
        target: targetName,
        name: componentName,
        component: relativeComponent,
        docs: relativeDocs,
        dependencies: [],
        placeholder: false,
        installDependencies: false,
      },
      values.json,
    );
    return;
  }

  const specificTemplate = path.join(config.rootDir, target.templateDir, `${componentName}.tsx`);
  const baseTemplate = path.join(config.rootDir, target.templateDir, target.baseTemplate);
  const hasSpecificTemplate = await exists(specificTemplate);
  if (!hasSpecificTemplate && !values['allow-placeholder']) {
    fail(
      `no complete template for "${targetName}/${componentName}". Run "pnpm scaffold list" or explicitly pass --allow-placeholder`,
    );
  }
  const templatePath = hasSpecificTemplate ? specificTemplate : baseTemplate;
  const placeholder = !hasSpecificTemplate;
  const raw = await readFile(templatePath, 'utf8');
  const named = placeholder ? raw.replaceAll('BaseTemplate', pascal).replaceAll('BaseNative', pascal) : raw;
  const transformed = transformImports(named, target.importRewrites);
  const dependencies = externalDependencies(transformed);
  const install = !values['no-install'];
  const plan: AddPlan = {
    status: 'create',
    target: targetName,
    name: componentName,
    template: path.relative(config.rootDir, templatePath).replaceAll('\\', '/'),
    component: relativeComponent,
    docs: relativeDocs,
    dependencies,
    placeholder,
    installDependencies: install,
  };
  if (values['dry-run']) {
    printPlan(plan, values.json);
    return;
  }

  if (dependencies.length > 0 && install) {
    await installDependencies(target, config, dependencies, values.json);
  }

  const metaPath = path.join(config.rootDir, target.docsMeta);
  const originalMeta = await readFile(metaPath, 'utf8');
  const meta = JSON.parse(originalMeta) as { pages: string[] };
  const nextPages = meta.pages.includes(componentName) ? meta.pages : [...meta.pages, componentName].sort();
  const nextMeta = `${JSON.stringify({ ...meta, pages: nextPages }, null, 2)}\n`;
  const docsAlreadyExists = await exists(docsPath);
  let componentCreated = false;
  let docsCreated = false;
  try {
    await mkdir(path.dirname(componentPath), { recursive: true });
    await writeFile(componentPath, transformed, { encoding: 'utf8', flag: 'wx' });
    componentCreated = true;
    if (!docsAlreadyExists) {
      await mkdir(path.dirname(docsPath), { recursive: true });
      await writeFile(docsPath, docsStub(target, componentName, pascal, placeholder), { encoding: 'utf8', flag: 'wx' });
      docsCreated = true;
    }
    if (nextMeta !== originalMeta) await writeFile(metaPath, nextMeta, 'utf8');
  } catch (error) {
    if (componentCreated) await unlink(componentPath).catch(() => undefined);
    if (docsCreated) await unlink(docsPath).catch(() => undefined);
    if (nextMeta !== originalMeta) await writeFile(metaPath, originalMeta, 'utf8');
    throw error;
  }

  if (values.json) {
    console.log(JSON.stringify({ ...plan, status: 'created' }));
    return;
  }
  console.log(`CREATED ${relativeComponent}`);
  console.log(`${docsAlreadyExists ? 'UNCHANGED' : 'CREATED'} ${relativeDocs}`);
  if (dependencies.length > 0 && !install) console.log(`REQUIRES ${dependencies.join(' ')}`);
  console.log('VERIFY pnpm agent check --changed');
}

/** Lists complete templates separately from the explicit placeholder escape hatch. */
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
    console.log(`  placeholder escape hatch: add ${targetName} <name> --allow-placeholder`);
  }
}
