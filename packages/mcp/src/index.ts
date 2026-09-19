/** Read-only stdio MCP. CLI and MCP share the same version-aware catalog reader. */
import { createInterface } from 'node:readline';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bounded, capabilityCard, findCapabilities, loadCatalog, recipeCard, resolveRecipes, selectImplementations } from '../../agent-workflow/src/catalog.ts';
import type { Detail } from '../../agent-workflow/src/catalog.ts';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const frameworks = ['react', 'vue', 'svelte', 'native', 'core', 'universal'];
const common = {
    framework: {
        type: 'string', enum: frameworks
    },
    runtime: {
        type: 'string', enum: ['browser', 'tauri', 'native', 'server']
    },
};
const details = {
    type: 'string', enum: ['summary', 'api', 'usage', 'full'], description: 'Summary is bounded; explicit detail returns the complete selected contract or example.'
};
const tools = [
    {
        name: 'find_capabilities', description: 'Find compatible capabilities, including explicitly compatible framework-neutral contracts.', inputSchema: {
            type: 'object', additionalProperties: false, properties: {
                ...common, query: {
                    type: 'string'
                }, kind: {
                    type: 'string', enum: ['component', 'block', 'contract', 'bridge']
                }, limit: {
                    type: 'integer', minimum: 1, maximum: 20
                }, detail: {
                    type: 'string', enum: ['summary', 'symbols']
                }
            }
        }
    },
    {
        name: 'get_component_docs', description: 'Get a source-checked import, public API, or framework-specific example. No implementation source is returned by default.', inputSchema: {
            type: 'object', additionalProperties: false, properties: {
                ...common, id: {
                    type: 'string'
                }, symbol: {
                    type: 'string'
                }, detail: details
            }
        }
    },
    {
        name: 'get_recipe', description: 'Get one composition recipe; framework-specific source examples are opt-in.', inputSchema: {
            type: 'object', additionalProperties: false, properties: {
                id: {
                    type: 'string'
                }, framework: common.framework, detail: details
            }
        }
    },
] as const;
function validateArgs(name: string, input: unknown): Record<string, string | number> {
    if (!input || typeof input !== 'object' || Array.isArray(input))
        throw new Error('Arguments must be an object');
    const tool = tools.find((candidate) => candidate.name === name);
    if (!tool)
        throw new Error(`Unknown tool: ${name}`);
    const schemas = tool.inputSchema.properties as Record<string, {
        type: string;
        enum?: readonly string[];
        minimum?: number;
        maximum?: number;
    }>;
    const args = input as Record<string, string | number>;
    for (const [key, value] of Object.entries(args)) {
        const schema = schemas[key];
        if (!schema)
            throw new Error(`Unknown argument ${key}`);
        if (schema.type === 'integer') {
            if (!Number.isInteger(value) || Number(value) < schema.minimum! || Number(value) > schema.maximum!)
                throw new Error(`Invalid ${key}`);
        }
        else if (typeof value !== 'string' || (schema.enum && !schema.enum.includes(value)))
            throw new Error(`Invalid ${key}`);
    }
    return args;
}
export async function dispatch(name: string, input: unknown): Promise<string> {
    const args = validateArgs(name, input);
    const snapshot = await loadCatalog(root);
    const framework = args.framework as string | undefined;
    if (name === 'find_capabilities') {
        const found = findCapabilities(snapshot.catalog, args.query as string ?? '', {
            framework, runtime: args.runtime as string | undefined, kind: args.kind as string | undefined
        });
        if (!found.length)
            return 'No matching capabilities. Try a narrower keyword or omit the runtime filter.';
        const limit = Number(args.limit ?? 5);
        const lines = found.slice(0, limit).map((entry) => `- ${entry.id} [${entry.kind}] - ${entry.summary}${args.detail === 'symbols' ? `\n  symbols: ${selectImplementations(entry, framework, args.runtime as string | undefined).flatMap(([, impl]) => impl.exports).join(', ')}` : ''}`);
        if (found.length > limit)
            lines.push(`${found.length - limit} more; narrow the query or raise limit.`);
        return args.detail === 'symbols' ? lines.join('\n') : bounded(lines.join('\n'));
    }
    if (name === 'get_component_docs') {
        if ((!args.id && !args.symbol) || (args.id && args.symbol))
            throw new Error('Provide exactly one id or symbol');
        return capabilityCard(root, snapshot, String(args.id ?? args.symbol), {
            framework, runtime: args.runtime as string | undefined, detail: args.detail as Detail | undefined
        });
    }
    const matching = resolveRecipes(snapshot.catalog, args.id ? String(args.id) : undefined, framework);
    if (!matching.length)
        throw new Error('Unknown recipe or unsupported framework');
    const explicit = args.detail === 'usage' || args.detail === 'full';
    if (explicit && matching.length > 1)
        throw new Error('Select one exact recipe before requesting example source');
    const result = (await Promise.all(matching.map((recipe) => recipeCard(root, recipe, framework, explicit)))).join('\n\n');
    return explicit ? result : bounded(result);
}
function send(id: unknown, result: unknown, error = false) {
    process.stdout.write(JSON.stringify({
        jsonrpc: '2.0', id, ...(error ? {
            error: result
        } : {
            result
        })
    }) + '\n');
}
const pending = new Set<Promise<void>>();
const rl = createInterface({
    input: process.stdin
});
rl.on('line', (line) => {
    if (!line.trim())
        return;
    let message: {
        jsonrpc?: string;
        id?: string | number | null;
        method?: string;
        params?: Record<string, unknown>;
    };
    try {
        message = JSON.parse(line);
    }
    catch {
        send(null, {
            code: -32700, message: 'Parse error'
        }, true);
        return;
    }
    if (!message || Array.isArray(message) || message.jsonrpc !== '2.0' || typeof message.method !== 'string') {
        send(null, {
            code: -32600, message: 'Invalid request'
        }, true);
        return;
    }
    if (message.id === undefined)
        return; // Notifications never receive a response.
    const { id, method, params } = message;
    if (method === 'initialize') {
        send(id, {
            protocolVersion: '2025-06-18', capabilities: {
                tools: {}
            }, serverInfo: {
                name: 'tauri-universal-mcp', version: '0.3.0'
            }
        });
    }
    else if (method === 'tools/list')
        send(id, {
            tools
        });
    else if (method === 'ping')
        send(id, {});
    else if (method === 'tools/call') {
        if (!tools.some((tool) => tool.name === params?.name)) {
            send(id, {
                code: -32602, message: `Unknown tool: ${String(params?.name)}`
            }, true);
            return;
        }
        const work = dispatch(String(params?.name), params?.arguments ?? {})
            .then((text) => send(id, {
            content: [{
                    type: 'text', text
                }]
        }))
            .catch((error: unknown) => send(id, {
            isError: true, content: [{
                    type: 'text', text: error instanceof Error ? error.message : String(error)
                }]
        }))
            .finally(() => { pending.delete(work); });
        pending.add(work);
    }
    else
        send(id, {
            code: -32601, message: `Method not found: ${method}`
        }, true);
});
// Do not drop in-flight reads when a client closes stdin after its last request.
rl.on('close', () => { void Promise.allSettled(pending); });
