import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

import type { ScaffoldConfig } from './config';
import { fail, runPnpm } from './config';
import { externalDependencies } from './transform';

interface Implementation {
  import: string;
  exports: string[];
  source: string;
}

interface CatalogEntry {
  id: string;
  kind: string;
  summary: string;
  keywords?: string[];
  docs: string;
  implementations: Record<string, Implementation>;
}

interface CatalogRecipe {
  id: string;
  summary: string;
  frameworks: string[];
  uses: string[];
  examples: Record<string, string>;
  command?: string;
  verify: string;
}

interface AgentCatalog {
  version: number;
  name: string;
  summary: string;
  entries: CatalogEntry[];
  recipes: CatalogRecipe[];
}

interface AgentBudgets {
  maxDefaultResponseChars: number;
  files: Record<string, { maxBytes?: number; maxNonblankLines?: number; maxEstimatedTokens?: number }>;
}

const agentUsage = `usage: pnpm agent <command> [args]

commands:
  find [query] [--framework <name>] [--kind <kind>] [--limit <n> | --all] [--json]
  inspect <id-or-symbol> [--framework <name>] [--full] [--json]
  recipe [id] [--framework <name>] [--example] [--json]
  budget [--check] [--json]
  catalog-check
  check [--changed | --all] [--verbose]
`;

async function fileExists(file: string): Promise<boolean> {
  return access(file)
    .then(() => true)
    .catch(() => false);
}

async function loadCatalog(config: ScaffoldConfig): Promise<AgentCatalog> {
  const raw = await readFile(path.join(config.rootDir, 'agent/catalog.json'), 'utf8');
  return JSON.parse(raw) as AgentCatalog;
}

function parseFilters(args: string[]) {
  return parseArgs({
    args,
    allowPositionals: true,
    options: {
      framework: { type: 'string' },
      kind: { type: 'string' },
      limit: { type: 'string' },
      all: { type: 'boolean', default: false },
      full: { type: 'boolean', default: false },
      example: { type: 'boolean', default: false },
      json: { type: 'boolean', default: false },
    },
  });
}

function entrySymbols(entry: CatalogEntry): string[] {
  return Object.values(entry.implementations).flatMap((implementation) => implementation.exports);
}

function entryMatches(entry: CatalogEntry, query: string, framework?: string, kind?: string): boolean {
  if (framework !== undefined && entry.implementations[framework] === undefined) return false;
  if (kind !== undefined && entry.kind !== kind) return false;
  const haystack = [entry.id, entry.kind, entry.summary, ...entrySymbols(entry), ...(entry.keywords ?? [])]
    .join(' ')
    .toLowerCase();
  return query === '' || query.split(/\s+/).every((word) => haystack.includes(word));
}

function rankEntry(entry: CatalogEntry, query: string): number {
  if (entry.id.toLowerCase() === query) return 0;
  if (entrySymbols(entry).some((symbol) => symbol.toLowerCase() === query)) return 1;
  if (entry.id.toLowerCase().startsWith(query)) return 2;
  return 3;
}

function entryLine(entry: CatalogEntry): string {
  return `${entry.id} [${entry.kind}; ${Object.keys(entry.implementations).join(',')}] - ${entry.summary}`;
}

function formatFind(entries: CatalogEntry[], total: number, framework?: string): string {
  const lines = entries.map(entryLine);
  if (entries.length < total) lines.push(`${total - entries.length} more; pass --all to show them.`);
  const first = entries[0];
  if (first !== undefined) {
    lines.push(`Inspect one: pnpm agent inspect ${first.id}${framework ? ` --framework ${framework}` : ''}`);
  }
  return lines.join('\n');
}

async function findEntries(config: ScaffoldConfig, args: string[]): Promise<void> {
  const { positionals, values } = parseFilters(args);
  if (values.all && values.limit !== undefined) fail('choose either --limit or --all');
  const query = positionals.join(' ').trim().toLowerCase();
  const catalog = await loadCatalog(config);
  const requestedLimit = values.limit === undefined ? 5 : Number(values.limit);
  if (!Number.isInteger(requestedLimit) || requestedLimit < 1) fail('--limit must be a positive integer');
  const matches = catalog.entries
    .filter((entry) => entryMatches(entry, query, values.framework, values.kind))
    .sort((a, b) => rankEntry(a, query) - rankEntry(b, query) || a.id.localeCompare(b.id));
  if (matches.length === 0) fail(`no catalog entries match "${query}"`);
  const visible = values.all ? matches : matches.slice(0, requestedLimit);
  if (values.json) {
    console.log(
      JSON.stringify({
        matches: visible.map((entry) => ({
          id: entry.id,
          kind: entry.kind,
          summary: entry.summary,
          frameworks: Object.keys(entry.implementations),
        })),
        total: matches.length,
      }),
    );
    return;
  }
  console.log(formatFind(visible, matches.length, values.framework));
}

function resolveEntry(catalog: AgentCatalog, id: string): CatalogEntry | undefined {
  const exact = catalog.entries.find((candidate) => candidate.id === id);
  if (exact !== undefined) return exact;
  const bySymbol = catalog.entries.filter((candidate) => entrySymbols(candidate).includes(id));
  if (bySymbol.length > 1) {
    fail(`"${id}" is exported by multiple entries: ${bySymbol.map((candidate) => candidate.id).join(', ')}`);
  }
  return bySymbol[0];
}

function selectedImplementations(entry: CatalogEntry, framework?: string): Array<[string, Implementation]> {
  if (framework === undefined) return Object.entries(entry.implementations);
  const implementation = entry.implementations[framework];
  if (implementation === undefined) fail(`${entry.id} has no ${framework} implementation`);
  return [[framework, implementation]];
}

async function formatInspect(
  config: ScaffoldConfig,
  entry: CatalogEntry,
  framework?: string,
  full = false,
): Promise<string> {
  const selected = selectedImplementations(entry, framework);
  const lines = [`${entry.id} [${entry.kind}] - ${entry.summary}`];
  if (framework === undefined && selected.length > 1 && !full) {
    lines.push(`frameworks: ${selected.map(([name]) => name).join(', ')}`);
    lines.push(`Select one: pnpm agent inspect ${entry.id} --framework <name>`);
    lines.push(`docs: ${entry.docs}`);
    return lines.join('\n');
  }
  for (const [name, implementation] of selected) {
    lines.push(`${name}: import { ${implementation.exports.join(', ')} } from '${implementation.import}'`);
    if (full) {
      lines.push(`  source: ${implementation.source}`);
      const source = await readFile(path.join(config.rootDir, implementation.source), 'utf8').catch(() => '');
      const dependencies = externalDependencies(source);
      if (dependencies.length > 0) lines.push(`  deps: ${dependencies.join(', ')}`);
    }
  }
  lines.push(`docs: ${entry.docs}`);
  return lines.join('\n');
}

async function inspectEntry(config: ScaffoldConfig, args: string[]): Promise<void> {
  const { positionals, values } = parseFilters(args);
  const [id] = positionals;
  if (id === undefined) fail('missing catalog id. Usage: pnpm agent inspect <id-or-symbol>');
  const catalog = await loadCatalog(config);
  const entry = resolveEntry(catalog, id);
  if (entry === undefined) fail(`unknown catalog id or symbol "${id}"`);
  const selected = selectedImplementations(entry, values.framework);
  if (values.json) {
    console.log(
      JSON.stringify(
        values.full
          ? entry
          : {
              id: entry.id,
              kind: entry.kind,
              summary: entry.summary,
              frameworks: selected.map(([name]) => name),
              implementation: selected.length === 1 ? selected[0][1] : undefined,
              docs: entry.docs,
            },
      ),
    );
    return;
  }
  console.log(await formatInspect(config, entry, values.framework, values.full));
}

async function formatRecipe(
  config: ScaffoldConfig,
  recipe: CatalogRecipe,
  framework?: string,
  includeExample = false,
): Promise<string> {
  const lines = [`${recipe.id} [${recipe.frameworks.join(',')}] - ${recipe.summary}`, `uses: ${recipe.uses.join(', ')}`];
  if (framework === undefined && recipe.frameworks.length > 1) {
    lines.push(`Select one: pnpm agent recipe ${recipe.id} --framework <name>`);
  } else {
    const selected = framework ?? recipe.frameworks[0];
    const example = recipe.examples[selected];
    if (example !== undefined) {
      lines.push(`${selected} example: ${example}`);
      if (includeExample) {
        lines.push('--- example ---', await readFile(path.join(config.rootDir, example), 'utf8'));
      }
    }
  }
  if (recipe.command !== undefined) lines.push(`start: ${recipe.command}`);
  lines.push(`verify: ${recipe.verify}`);
  return lines.join('\n');
}

async function showRecipe(config: ScaffoldConfig, args: string[]): Promise<void> {
  const { positionals, values } = parseFilters(args);
  const [id] = positionals;
  const catalog = await loadCatalog(config);
  const recipes = catalog.recipes.filter(
    (recipe) =>
      (id === undefined || recipe.id === id) &&
      (values.framework === undefined || recipe.frameworks.includes(values.framework)),
  );
  if (recipes.length === 0) fail(`unknown recipe "${id ?? ''}"`);
  if (values.json) {
    console.log(
      JSON.stringify(
        recipes.map((recipe) => ({
          id: recipe.id,
          summary: recipe.summary,
          frameworks: values.framework === undefined ? recipe.frameworks : [values.framework],
          uses: recipe.uses,
          examples:
            values.framework === undefined ? {} : { [values.framework]: recipe.examples[values.framework] },
          command: recipe.command,
          verify: recipe.verify,
        })),
      ),
    );
    return;
  }
  for (const recipe of recipes) {
    console.log(await formatRecipe(config, recipe, values.framework, values.example));
  }
}

function textMetrics(text: string) {
  return {
    bytes: Buffer.byteLength(text),
    nonblankLines: text.split(/\r?\n/).filter((line) => line.trim() !== '').length,
    estimatedTokens: Math.ceil(text.length / 4),
  };
}

async function checkBudgets(config: ScaffoldConfig): Promise<Array<{ name: string; actual: number; limit: number; pass: boolean }>> {
  const budgets = JSON.parse(
    await readFile(path.join(config.rootDir, 'agent/budgets.json'), 'utf8'),
  ) as AgentBudgets;
  const results: Array<{ name: string; actual: number; limit: number; pass: boolean }> = [];
  for (const [file, limits] of Object.entries(budgets.files)) {
    const metrics = textMetrics(await readFile(path.join(config.rootDir, file), 'utf8'));
    const candidates = [
      ['bytes', metrics.bytes, limits.maxBytes],
      ['nonblankLines', metrics.nonblankLines, limits.maxNonblankLines],
      ['estimatedTokens', metrics.estimatedTokens, limits.maxEstimatedTokens],
    ] as const;
    for (const [metric, actual, limit] of candidates) {
      if (limit !== undefined) results.push({ name: `${file}:${metric}`, actual, limit, pass: actual <= limit });
    }
  }
  const catalog = await loadCatalog(config);
  const button = resolveEntry(catalog, 'ui.button');
  const table = resolveEntry(catalog, 'block.data-table');
  const crud = catalog.recipes.find((recipe) => recipe.id === 'crud-page');
  if (button !== undefined && table !== undefined && crud !== undefined) {
    const samples = [
      formatFind([button], 1, 'react'),
      await formatInspect(config, table, 'react'),
      await formatRecipe(config, crud, 'react'),
    ];
    const actual = Math.max(...samples.map((sample) => sample.length));
    results.push({
      name: 'cli:defaultResponseChars',
      actual,
      limit: budgets.maxDefaultResponseChars,
      pass: actual <= budgets.maxDefaultResponseChars,
    });
  }
  return results;
}

async function budget(config: ScaffoldConfig, args: string[], exitOnFailure = true): Promise<boolean> {
  const { values } = parseArgs({
    args,
    options: {
      check: { type: 'boolean', default: false },
      json: { type: 'boolean', default: false },
      quiet: { type: 'boolean', default: false },
    },
  });
  const results = await checkBudgets(config);
  const passed = results.every((result) => result.pass);
  if (values.json) console.log(JSON.stringify({ results, pass: passed }));
  else if (!values.quiet || !passed) {
    for (const result of results) {
      console.log(`${result.pass ? 'PASS' : 'FAIL'} ${result.name} ${result.actual}/${result.limit}`);
    }
  }
  if (values.check && !passed && exitOnFailure) process.exit(1);
  return passed;
}

async function validateCatalog(config: ScaffoldConfig): Promise<string[]> {
  const catalog = await loadCatalog(config);
  const errors: string[] = [];
  const ids = new Set<string>();
  const referencedDocs = new Set<string>();

  for (const entry of catalog.entries) {
    if (ids.has(entry.id)) errors.push(`duplicate entry id: ${entry.id}`);
    ids.add(entry.id);
    referencedDocs.add(entry.docs.replaceAll('\\', '/'));
    if (!(await fileExists(path.join(config.rootDir, entry.docs)))) errors.push(`missing docs: ${entry.docs}`);
    for (const implementation of Object.values(entry.implementations)) {
      if (!(await fileExists(path.join(config.rootDir, implementation.source)))) {
        errors.push(`missing source: ${implementation.source}`);
      }
    }
  }

  for (const recipe of catalog.recipes) {
    if (ids.has(`recipe:${recipe.id}`)) errors.push(`duplicate recipe id: ${recipe.id}`);
    ids.add(`recipe:${recipe.id}`);
    for (const used of recipe.uses) {
      if (!ids.has(used) && !catalog.entries.some((entry) => entry.id === used)) {
        errors.push(`recipe ${recipe.id} uses unknown entry: ${used}`);
      }
    }
    for (const example of Object.values(recipe.examples)) {
      if (!(await fileExists(path.join(config.rootDir, example)))) errors.push(`missing example: ${example}`);
    }
  }

  for (const section of ['components', 'blocks']) {
    const base = `apps/tauri-app/content/docs/${section}`;
    const meta = JSON.parse(await readFile(path.join(config.rootDir, base, 'meta.json'), 'utf8')) as { pages: string[] };
    for (const slug of meta.pages.filter((page) => page !== 'index')) {
      const doc = `${base}/${slug}.mdx`;
      if (!referencedDocs.has(doc)) errors.push(`uncataloged ${section} docs: ${doc}`);
    }
  }

  const catalogSources = new Set(
    catalog.entries.flatMap((entry) => Object.values(entry.implementations).map((implementation) => implementation.source)),
  );
  for (const [sourceDir, label] of [
    ['packages/ui/src/components/ui', 'UI'],
    ['packages/ui-native/src/components/ui', 'native UI'],
  ] as const) {
    const dir = path.join(config.rootDir, sourceDir);
    const sources = new Set(
      (await readdir(dir)).filter((file) => file.endsWith('.tsx')).map((file) => `${sourceDir}/${file}`),
    );
    for (const source of sources) {
      if (!catalogSources.has(source)) errors.push(`uncataloged ${label} source: ${source}`);
    }
  }
  return errors;
}

async function catalogCheck(config: ScaffoldConfig, quiet = false): Promise<boolean> {
  const errors = await validateCatalog(config);
  if (errors.length > 0) {
    if (!quiet) console.error(errors.map((error) => `- ${error}`).join('\n'));
    return false;
  }
  if (!quiet) console.log('PASS agent catalog');
  return true;
}

function gitChangedFiles(rootDir: string): string[] {
  const commands = [
    ['diff', '--name-only', '--diff-filter=ACMR', 'HEAD'],
    ['ls-files', '--others', '--exclude-standard'],
  ];
  const files = new Set<string>();
  for (const args of commands) {
    const result = spawnSync('git', args, { cwd: rootDir, encoding: 'utf8' });
    if (result.status !== 0) return [];
    for (const line of result.stdout.split(/\r?\n/)) {
      if (line !== '') files.add(line.replaceAll('\\', '/'));
    }
  }
  return [...files];
}

interface CheckCommand {
  label: string;
  args: string[];
}

function affects(files: string[], prefixes: string[]): boolean {
  return files.some((file) => prefixes.some((prefix) => file === prefix || file.startsWith(`${prefix}/`)));
}

function selectedChecks(files: string[], all: boolean): CheckCommand[] {
  const rootChanged = affects(files, ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'tsconfig.base.json']);
  const include = (prefixes: string[]) => all || rootChanged || affects(files, prefixes);
  const checks: CheckCommand[] = [
    { label: 'agent docs', args: ['agent:docs:check'] },
    { label: 'lint', args: ['lint'] },
  ];
  if (include(['agent', 'packages/cli', 'scaffold.config.json', 'scripts'])) {
    checks.push({ label: 'CLI typecheck', args: ['exec', 'tsc', '-p', 'packages/cli/tsconfig.json'] });
    checks.push({ label: 'CLI integration', args: ['agent:test'] });
  }
  if (include(['agent', 'packages/mcp', 'apps/tauri-app/content/docs'])) {
    checks.push({ label: 'MCP integration', args: ['mcp:test'] });
  }
  if (include(['apps/tauri-app', 'packages/core', 'packages/tauri-api', 'packages/ui', 'packages/pro', 'packages/pro-core'])) {
    checks.push({ label: 'React app', args: ['--filter', '@app/tauri-app', 'build'] });
  }
  if (include(['apps/vue-playground', 'packages/core', 'packages/tauri-api', 'packages/pro-vue', 'packages/pro-core'])) {
    checks.push({ label: 'Vue playground', args: ['--filter', '@app/vue-playground', 'build'] });
  }
  if (include(['apps/svelte-playground', 'packages/core', 'packages/tauri-api', 'packages/pro-svelte', 'packages/pro-core'])) {
    checks.push({ label: 'Svelte playground', args: ['--filter', '@app/svelte-playground', 'build'] });
  }
  if (include(['apps/native-playground', 'packages/ui-native', 'packages/ui/src/tokens.ts'])) {
    checks.push({ label: 'Native playground', args: ['--filter', '@app/native-playground', 'build'] });
  }
  if (include(['apps/web-todo', 'packages/core', 'packages/tauri-api', 'packages/ui', 'packages/pro', 'packages/pro-core'])) {
    checks.push({ label: 'web-todo', args: ['--filter', '@app/web-todo', 'build'] });
  }
  return checks;
}

function compactFailure(output: string): string {
  const trimmed = output.trim();
  return trimmed.length <= 12_000 ? trimmed : `...output truncated...\n${trimmed.slice(-12_000)}`;
}

async function runChecks(config: ScaffoldConfig, args: string[]): Promise<void> {
  const { values } = parseArgs({
    args,
    options: {
      changed: { type: 'boolean', default: false },
      all: { type: 'boolean', default: false },
      verbose: { type: 'boolean', default: false },
    },
  });
  if (values.changed && values.all) fail('choose either --changed or --all');
  const started = performance.now();
  if (!(await catalogCheck(config, true))) {
    await catalogCheck(config);
    process.exit(1);
  }
  if (!(await budget(config, ['--quiet'], false))) process.exit(1);

  const files = values.all ? [] : gitChangedFiles(config.rootDir);
  const checks = selectedChecks(files, values.all);
  for (const check of checks) {
    const result = runPnpm(check.args, {
      cwd: config.rootDir,
      encoding: 'utf8',
      env: { ...process.env, CI: '1' },
    });
    if (result.status !== 0) {
      console.error(`FAIL ${check.label}`);
      const output = compactFailure(`${result.stdout}\n${result.stderr}`);
      if (output !== '') console.error(output);
      process.exit(result.status ?? 1);
    }
    if (values.verbose) console.log(`PASS ${check.label}`);
  }
  const seconds = ((performance.now() - started) / 1000).toFixed(1);
  console.log(`PASS ${checks.length + 2} checks, ${seconds}s`);
}

export async function agent(config: ScaffoldConfig, args: string[]): Promise<void> {
  const [command, ...rest] = args;
  switch (command) {
    case 'find':
      await findEntries(config, rest);
      break;
    case 'inspect':
      await inspectEntry(config, rest);
      break;
    case 'recipe':
      await showRecipe(config, rest);
      break;
    case 'budget':
      await budget(config, rest);
      break;
    case 'catalog-check':
      if (!(await catalogCheck(config))) process.exit(1);
      break;
    case 'check':
      await runChecks(config, rest);
      break;
    default:
      console.log(agentUsage);
      if (command !== undefined) fail(`unknown agent command "${command}"`);
  }
}
