/**
 * Local stdio MCP server for the tauri-universal library.
 *
 * Serves the checked-in capability catalog and generated Markdown docs to
 * coding agents with no network access, API keys, or hosting: the consumer
 * registers the command in their MCP client config and every tool returns
 * exact answers from the curated sources (catalog.json + generated .md).
 *
 * Protocol: MCP over stdio (newline-delimited JSON-RPC 2.0).
 */
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
  version: number;
  name: string;
  summary: string;
  entries: CatalogEntry[];
  recipes: CatalogRecipe[];
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const catalogPath = path.join(repoRoot, 'agent', 'catalog.json');
const docsDir = path.join(repoRoot, 'apps', 'tauri-app', 'public', 'docs');

let catalog: AgentCatalog | null = null;

async function loadCatalog(): Promise<AgentCatalog> {
  if (catalog === null) {
    catalog = JSON.parse(await readFile(catalogPath, 'utf8')) as AgentCatalog;
  }
  return catalog;
}

/** Markdown page path for a catalog entry: docs frontmatter path + .md. */
function markdownPath(entry: CatalogEntry): string {
  const mdx = entry.docs.replace(/^apps\/tauri-app\/content\/docs\//, '').replace(/\.mdx$/, '');
  return path.join(docsDir, `${mdx}.md`);
}

function entryMatches(entry: CatalogEntry, query: string, framework?: string): boolean {
  if (framework !== undefined && entry.implementations[framework] === undefined) return false;
  const q = query.toLowerCase();
  return (
    entry.id.toLowerCase().includes(q) ||
    entry.summary.toLowerCase().includes(q) ||
    (entry.keywords ?? []).some((keyword) => keyword.toLowerCase().includes(q)) ||
    Object.values(entry.implementations).some((impl) =>
      impl.exports.some((symbol) => symbol.toLowerCase().includes(q)),
    )
  );
}

// ---------------------------------------------------------------------------
// Tool implementations
// ---------------------------------------------------------------------------

async function toolFind(args: {
  query?: string;
  framework?: string;
  kind?: string;
}): Promise<string> {
  const cat = await loadCatalog();
  let matches = cat.entries;
  if (args.query !== undefined && args.query !== '') {
    matches = matches.filter((entry) => entryMatches(entry, args.query as string, args.framework));
  } else if (args.framework !== undefined || args.kind !== undefined) {
    matches = matches.filter(
      (entry) =>
        (args.framework === undefined || entry.implementations[args.framework] !== undefined) &&
        (args.kind === undefined || entry.kind === args.kind),
    );
  }
  if (matches.length === 0) {
    return `No catalog entries match. ${cat.summary}`;
  }
  return matches
    .map((entry) => {
      const frameworks = Object.keys(entry.implementations).join(', ');
      const symbols = Object.values(entry.implementations)
        .flatMap((impl) => impl.exports)
        .join(', ');
      return `- ${entry.id} (${entry.kind}): ${frameworks} — ${entry.summary}\n  symbols: ${symbols}`;
    })
    .join('\n');
}

async function toolDocs(args: { id?: string; symbol?: string }): Promise<string> {
  const cat = await loadCatalog();
  const needle = (args.id ?? args.symbol ?? '').toLowerCase();
  const entry =
    cat.entries.find((e) => e.id.toLowerCase() === needle) ??
    cat.entries.find((e) =>
      Object.values(e.implementations).some((impl) =>
        impl.exports.some((symbol) => symbol.toLowerCase() === needle),
      ),
    );
  if (entry === undefined) {
    return `Unknown capability "${args.id ?? args.symbol}". Use find_capabilities to discover ids.`;
  }

  const implLines = Object.entries(entry.implementations)
    .map(([framework, impl]) => `- ${framework}: import { ${impl.exports.join(', ')} } from '${impl.import}'`)
    .join('\n');

  let markdown = '';
  try {
    markdown = await readFile(markdownPath(entry), 'utf8');
  } catch {
    // docs are optional; the catalog facts below still answer the query
  }
  return `# ${entry.id}\n\n${entry.summary}\n\n## Implementations\n${implLines}\n\n${markdown}`;
}

async function toolRecipe(args: { id?: string; framework?: string }): Promise<string> {
  const cat = await loadCatalog();
  const needle = (args.id ?? '').toLowerCase();
  const recipes = needle === '' ? cat.recipes : cat.recipes.filter((r) => r.id.toLowerCase().includes(needle));
  if (recipes.length === 0) {
    return `No recipes${needle === '' ? '' : ` matching "${args.id}"`}. Available: ${cat.recipes.map((r) => r.id).join(', ')}`;
  }
  return recipes
    .map((recipe) => {
      const lines = [
        `# Recipe: ${recipe.id} [${recipe.frameworks.join(', ')}]`,
        recipe.summary,
        `uses: ${recipe.uses.join(', ')}`,
      ];
      if (recipe.command !== undefined) lines.push(`start: ${recipe.command}`);
      for (const [framework, example] of Object.entries(recipe.examples)) {
        lines.push(`${framework} example: ${example}`);
      }
      lines.push(`verify: ${recipe.verify}`);
      return lines.join('\n');
    })
    .join('\n\n');
}

// ---------------------------------------------------------------------------
// MCP protocol plumbing (stdio, line-delimited JSON-RPC)
// ---------------------------------------------------------------------------

const tools = [
  {
    name: 'find_capabilities',
    description:
      'Find library components and blocks by keyword, exported symbol, id, framework, or kind. Returns ids, frameworks, and exported symbols.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Keyword, symbol, or id fragment to match' },
        framework: {
          type: 'string',
          enum: ['react', 'vue', 'svelte', 'native'],
          description: 'Restrict to one framework implementation',
        },
        kind: { type: 'string', enum: ['component', 'block'], description: 'Entry kind' },
      },
    },
  },
  {
    name: 'get_component_docs',
    description:
      'Full documentation for one capability by catalog id (ui.button) or exported symbol (Button): import paths, variants, and usage examples.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Catalog id such as ui.button' },
        symbol: { type: 'string', description: 'Exported symbol such as Button' },
      },
    },
  },
  {
    name: 'get_recipe',
    description: 'Proven composition recipes (e.g. crud-page) with required capabilities, examples, and verify command.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Recipe id fragment; omit to list all' },
      },
    },
  },
] as const;

type ToolName = (typeof tools)[number]['name'];

async function dispatch(tool: ToolName, args: Record<string, unknown>): Promise<string> {
  switch (tool) {
    case 'find_capabilities':
      return toolFind(args as { query?: string; framework?: string; kind?: string });
    case 'get_component_docs':
      return toolDocs(args as { id?: string; symbol?: string });
    case 'get_recipe':
      return toolRecipe(args as { id?: string });
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
    message = JSON.parse(line) as { id?: unknown; method?: string; params?: Record<string, unknown> };
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
        serverInfo: { name: 'tauri-universal-mcp', version: '0.1.0' },
      });
      break;
    case 'notifications/initialized':
      break;
    case 'tools/list':
      respond(id, { tools });
      break;
    case 'tools/call': {
      const name = params?.name as ToolName;
      if (!tools.some((t) => t.name === name)) {
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
      break;
  }
});

rl.on('close', () => process.exit(0));
