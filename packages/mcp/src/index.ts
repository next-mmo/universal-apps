/** Local, dependency-free stdio MCP server for token-bounded library context. */
import { createInterface } from 'node:readline';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
  summary: string;
  entries: CatalogEntry[];
  recipes: CatalogRecipe[];
}

type Detail = 'summary' | 'usage' | 'full';
const defaultResponseLimit = 1200;

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const catalogPath = path.join(repoRoot, 'agent', 'catalog.json');
const docsDir = path.join(repoRoot, 'apps', 'tauri-app', 'public', 'docs');

let catalog: AgentCatalog | undefined;

async function loadCatalog(): Promise<AgentCatalog> {
  catalog ??= JSON.parse(await readFile(catalogPath, 'utf8')) as AgentCatalog;
  return catalog;
}

function markdownPath(entry: CatalogEntry): string {
  const relative = entry.docs.replace(/^apps\/tauri-app\/content\/docs\//, '').replace(/\.mdx$/, '');
  return path.join(docsDir, `${relative}.md`);
}

function entrySymbols(entry: CatalogEntry): string[] {
  return Object.values(entry.implementations).flatMap((implementation) => implementation.exports);
}

function entryMatches(entry: CatalogEntry, query: string, framework?: string, kind?: string): boolean {
  if (framework !== undefined && entry.implementations[framework] === undefined) return false;
  if (kind !== undefined && entry.kind !== kind) return false;
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const haystack = [entry.id, entry.kind, entry.summary, ...(entry.keywords ?? []), ...entrySymbols(entry)]
    .join(' ')
    .toLowerCase();
  return words.every((word) => haystack.includes(word));
}

function rankEntry(entry: CatalogEntry, query: string): number {
  const needle = query.toLowerCase();
  if (entry.id.toLowerCase() === needle) return 0;
  if (entrySymbols(entry).some((symbol) => symbol.toLowerCase() === needle)) return 1;
  if (entry.id.toLowerCase().startsWith(needle)) return 2;
  return 3;
}

function resolveEntry(catalogValue: AgentCatalog, id?: string, symbol?: string): CatalogEntry | undefined {
  const needle = (id ?? symbol ?? '').toLowerCase();
  return (
    catalogValue.entries.find((entry) => entry.id.toLowerCase() === needle) ??
    catalogValue.entries.find((entry) =>
      entrySymbols(entry).some((candidate) => candidate.toLowerCase() === needle),
    )
  );
}

function section(markdown: string, heading: string): string {
  const marker = `## ${heading}`;
  const start = markdown.indexOf(marker);
  if (start < 0) return '';
  const body = markdown.slice(start + marker.length).trimStart();
  const next = body.search(/^## /m);
  return (next < 0 ? body : body.slice(0, next)).trim();
}

function bounded(text: string): string {
  return text.length <= defaultResponseLimit
    ? text
    : `${text.slice(0, defaultResponseLimit - 58).trimEnd()}\n...response capped; narrow the query or request explicit detail.`;
}

async function toolFind(args: {
  query?: string;
  framework?: string;
  kind?: string;
  limit?: number;
  detail?: 'summary' | 'symbols';
}): Promise<string> {
  const catalogValue = await loadCatalog();
  const query = args.query ?? '';
  const requestedLimit = Number.isInteger(args.limit) ? Number(args.limit) : 5;
  const limit = Math.min(Math.max(requestedLimit, 1), 20);
  const matches = catalogValue.entries
    .filter((entry) => entryMatches(entry, query, args.framework, args.kind))
    .sort((a, b) => rankEntry(a, query) - rankEntry(b, query) || a.id.localeCompare(b.id));
  if (matches.length === 0) return `No catalog entries match. ${catalogValue.summary}`;
  const lines = matches.slice(0, limit).map((entry) => {
    const base = `- ${entry.id} [${entry.kind}; ${Object.keys(entry.implementations).join(',')}] - ${entry.summary}`;
    return args.detail === 'symbols' ? `${base}\n  symbols: ${entrySymbols(entry).join(', ')}` : base;
  });
  if (matches.length > limit) lines.push(`${matches.length - limit} more; narrow the query or raise limit.`);
  const result = lines.join('\n');
  return args.detail === 'symbols' ? result : bounded(result);
}

async function toolDocs(args: {
  id?: string;
  symbol?: string;
  framework?: string;
  detail?: Detail;
}): Promise<string> {
  const catalogValue = await loadCatalog();
  const entry = resolveEntry(catalogValue, args.id, args.symbol);
  if (entry === undefined) {
    return `Unknown capability "${args.id ?? args.symbol ?? ''}". Use find_capabilities first.`;
  }
  const detail = args.detail ?? 'summary';
  const allImplementations = Object.entries(entry.implementations);
  if (args.framework === undefined && allImplementations.length > 1 && detail !== 'full') {
    return [
      `# ${entry.id}`,
      entry.summary,
      `frameworks: ${allImplementations.map(([framework]) => framework).join(', ')}`,
      `Call again with framework to get one exact import.`,
    ].join('\n');
  }
  const selected =
    args.framework === undefined
      ? allImplementations
      : allImplementations.filter(([framework]) => framework === args.framework);
  if (selected.length === 0) return `${entry.id} has no ${args.framework} implementation.`;
  const imports = selected
    .map(([framework, implementation]) =>
      `${framework}: import { ${implementation.exports.join(', ')} } from '${implementation.import}'`,
    )
    .join('\n');
  if (detail === 'summary') return bounded(`# ${entry.id}\n${entry.summary}\n${imports}\ndocs: ${entry.docs}`);
  const markdown = await readFile(markdownPath(entry), 'utf8').catch(() => '');
  if (detail === 'usage') {
    const usage = section(markdown, 'Usage');
    return `# ${entry.id}\n${entry.summary}\n${imports}${usage ? `\n\n## Usage\n${usage}` : ''}`;
  }
  return `# ${entry.id}\n${entry.summary}\n${imports}${markdown ? `\n\n${markdown}` : ''}`;
}

async function toolRecipe(args: { id?: string; framework?: string; detail?: Detail }): Promise<string> {
  const catalogValue = await loadCatalog();
  const needle = (args.id ?? '').toLowerCase();
  const recipes = catalogValue.recipes.filter(
    (recipe) =>
      (needle === '' || recipe.id.toLowerCase().includes(needle)) &&
      (args.framework === undefined || recipe.frameworks.includes(args.framework)),
  );
  if (recipes.length === 0) {
    return `No recipes match. Available: ${catalogValue.recipes.map((recipe) => recipe.id).join(', ')}`;
  }
  const detail = args.detail ?? 'summary';
  const output: string[] = [];
  for (const recipe of recipes) {
    const lines = [
      `# Recipe: ${recipe.id} [${recipe.frameworks.join(',')}]`,
      recipe.summary,
      `uses: ${recipe.uses.join(', ')}`,
    ];
    if (args.framework === undefined && recipe.frameworks.length > 1 && detail !== 'full') {
      lines.push('Call again with framework to get one exact example.');
    } else {
      const frameworks = args.framework === undefined ? recipe.frameworks : [args.framework];
      for (const framework of frameworks) {
        const example = recipe.examples[framework];
        if (example === undefined) continue;
        lines.push(`${framework} example: ${example}`);
        if (detail === 'usage' || detail === 'full') {
          const source = await readFile(path.join(repoRoot, example), 'utf8').catch(() => '');
          if (source !== '') lines.push(`\n\`\`\`${path.extname(example).slice(1)}\n${source}\n\`\`\``);
        }
      }
    }
    if (recipe.command !== undefined) lines.push(`start: ${recipe.command}`);
    lines.push(`verify: ${recipe.verify}`);
    output.push(lines.join('\n'));
  }
  const result = output.join('\n\n');
  return detail === 'summary' ? bounded(result) : result;
}

const tools = [
  {
    name: 'find_capabilities',
    description: 'Find up to five matching library capabilities. Narrow by framework or kind; symbols are opt-in.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Keyword, symbol, or id fragment' },
        framework: { type: 'string', enum: ['react', 'vue', 'svelte', 'native', 'core', 'universal'] },
        kind: { type: 'string', enum: ['component', 'block', 'contract', 'bridge'] },
        limit: { type: 'number', minimum: 1, maximum: 20, description: 'Defaults to 5' },
        detail: { type: 'string', enum: ['summary', 'symbols'], description: 'Defaults to summary' },
      },
    },
  },
  {
    name: 'get_component_docs',
    description: 'Get one capability with progressive detail. Summary is compact; usage/full are explicit.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Catalog id such as ui.button' },
        symbol: { type: 'string', description: 'Exported symbol such as Button' },
        framework: { type: 'string', enum: ['react', 'vue', 'svelte', 'native', 'core', 'universal'] },
        detail: { type: 'string', enum: ['summary', 'usage', 'full'], description: 'Defaults to summary' },
      },
    },
  },
  {
    name: 'get_recipe',
    description: 'Get a proven composition recipe. Select a framework; complete example source is opt-in.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Recipe id fragment; omit to list' },
        framework: { type: 'string', enum: ['react', 'vue', 'svelte', 'native', 'universal'] },
        detail: { type: 'string', enum: ['summary', 'usage', 'full'], description: 'Defaults to summary' },
      },
    },
  },
] as const;

type ToolName = (typeof tools)[number]['name'];

async function dispatch(tool: ToolName, args: Record<string, unknown>): Promise<string> {
  switch (tool) {
    case 'find_capabilities':
      return toolFind(args as Parameters<typeof toolFind>[0]);
    case 'get_component_docs':
      return toolDocs(args as Parameters<typeof toolDocs>[0]);
    case 'get_recipe':
      return toolRecipe(args as Parameters<typeof toolRecipe>[0]);
  }
}

function respond(id: unknown, result: unknown): void {
  process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id, result })}\n`);
}

function respondError(id: unknown, code: number, message: string): void {
  process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } })}\n`);
}

const rl = createInterface({ input: process.stdin });

rl.on('line', (line) => {
  if (line.trim() === '') return;
  let message: { id?: unknown; method?: string; params?: Record<string, unknown> };
  try {
    message = JSON.parse(line) as typeof message;
  } catch {
    respondError(null, -32700, 'Parse error');
    return;
  }
  const { id, method, params } = message;
  switch (method) {
    case 'initialize':
      respond(id, {
        protocolVersion: '2025-06-18',
        capabilities: { tools: {} },
        serverInfo: { name: 'tauri-universal-mcp', version: '0.2.0' },
      });
      break;
    case 'notifications/initialized':
      break;
    case 'tools/list':
      respond(id, { tools });
      break;
    case 'tools/call': {
      const name = params?.name as ToolName;
      if (!tools.some((tool) => tool.name === name)) {
        respondError(id, -32602, `Unknown tool: ${String(name)}`);
        break;
      }
      dispatch(name, (params?.arguments as Record<string, unknown>) ?? {})
        .then((text) => respond(id, { content: [{ type: 'text', text }] }))
        .catch((error: unknown) =>
          respond(id, {
            content: [{ type: 'text', text: `error: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true,
          }),
        );
      break;
    }
    case 'ping':
      respond(id, {});
      break;
    default:
      if (id !== undefined) respondError(id, -32601, `Method not found: ${String(method)}`);
  }
});

rl.on('close', () => process.exit(0));
