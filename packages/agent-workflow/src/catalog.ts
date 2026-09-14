import { createHash } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { inspectSource } from './source-contract.ts';
export interface Implementation {
    import: string;
    exports: string[];
    source: string;
    defaultExport?: string;
    consumers?: string[];
    runtimes?: string[];
    docs?: string;
    example?: string;
}
export interface CatalogEntry {
    id: string;
    kind: string;
    summary: string;
    keywords?: string[];
    docs: string;
    implementations: Record<string, Implementation>;
}
export interface CatalogRecipe {
    id: string;
    summary: string;
    frameworks: string[];
    uses: string[];
    examples: Record<string, string>;
    command?: string;
    verify: string;
}
export interface AgentCatalog {
    version: number;
    name: string;
    summary: string;
    entries: CatalogEntry[];
    recipes: CatalogRecipe[];
}
export interface CatalogSnapshot {
    catalog: AgentCatalog;
    revision: string;
}
export type Detail = 'summary' | 'api' | 'usage' | 'full';
const DEFAULT_LIMIT = 1200;
/** Only catalog-owned files are read; realpath also rejects symlink escapes. */
export async function readOwned(root: string, relative: string): Promise<string> {
    if (path.isAbsolute(relative) || relative.split(/[\\/]/).includes('..')) {
        throw new Error(`Path must stay within the workspace: ${relative}`);
    }
    const base = await realpath(root);
    const absolute = await realpath(path.join(base, relative));
    const rel = path.relative(base, absolute);
    if (rel === '..' || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) {
        throw new Error(`Path escapes the workspace: ${relative}`);
    }
    return readFile(absolute, 'utf8');
}
export function hash(text: string): string {
    return createHash('sha256').update(text).digest('hex').slice(0, 16);
}
/** Intentionally read the small manifest again: a long-lived MCP must see changes. */
export async function loadCatalog(root: string): Promise<CatalogSnapshot> {
    const text = await readOwned(root, 'agent/catalog.json');
    const catalog = JSON.parse(text) as AgentCatalog;
    if (!Array.isArray(catalog.entries) || !Array.isArray(catalog.recipes)) {
        throw new Error('Invalid catalog: entries and recipes must be arrays');
    }
    const ids = catalog.entries.map((entry) => entry.id);
    if (new Set(ids).size !== ids.length)
        throw new Error('Duplicate capability id');
    return {
        catalog, revision: hash(text)
    };
}
export function compatible(implementation: Implementation, name: string, framework?: string, runtime?: string): boolean {
    return (framework === undefined || name === framework || implementation.consumers?.includes(framework) === true)
        && (runtime === undefined || implementation.runtimes?.includes(runtime) === true);
}
export function selectImplementations(entry: CatalogEntry, framework?: string, runtime?: string): Array<[
    string,
    Implementation
]> {
    const matches = Object.entries(entry.implementations).filter(([name, impl]) => compatible(impl, name, framework, runtime));
    if (framework && entry.implementations[framework])
        return matches.filter(([name]) => name === framework);
    return matches;
}
export function symbols(entry: CatalogEntry): string[] {
    return Object.values(entry.implementations).flatMap((impl) => impl.exports);
}
export function resolveEntry(catalog: AgentCatalog, id: string, options: { framework?: string; runtime?: string } = {}): CatalogEntry {
    const needle = id.toLowerCase();
    const exact = catalog.entries.find((entry) => entry.id.toLowerCase() === needle);
    if (exact)
        return exact;
    const matches = catalog.entries.filter((entry) => selectImplementations(entry, options.framework, options.runtime)
        .some(([, impl]) => [...impl.exports, ...(impl.defaultExport ? [impl.defaultExport] : [])]
            .some((symbol) => symbol.toLowerCase() === needle)));
    if (matches.length !== 1)
        throw new Error(matches.length ? `Ambiguous symbol ${id}; use a capability id` : `Unknown or unsupported symbol ${id} for the selected framework/runtime; use find first`);
    return matches[0];
}
export function findCapabilities(catalog: AgentCatalog, query = '', options: {
    framework?: string;
    runtime?: string;
    kind?: string;
} = {}): CatalogEntry[] {
    const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return catalog.entries.filter((entry) => {
        if (options.kind && entry.kind !== options.kind)
            return false;
        const implementations = selectImplementations(entry, options.framework, options.runtime);
        if (!implementations.length)
            return false;
        const selectedSymbols = implementations.flatMap(([, impl]) => impl.exports);
        const haystack = [entry.id, entry.summary, ...(entry.keywords ?? []), ...selectedSymbols].join(' ').toLowerCase();
        return words.every((word) => haystack.includes(word));
    }).sort((a, b) => {
        const rank = (entry: CatalogEntry) => entry.id.toLowerCase() === query.toLowerCase() ? 0
            : symbols(entry).some((s) => s.toLowerCase() === query.toLowerCase()) ? 1 : 2;
        return rank(a) - rank(b) || a.id.localeCompare(b.id);
    });
}
/** Compact summaries end at a line boundary. Never use this to truncate code. */
export function bounded(text: string, limit = DEFAULT_LIMIT): string {
    if (!Number.isInteger(limit) || limit < 128)
        throw new Error('Response budget must be an integer >= 128');
    if (text.length <= limit)
        return text;
    const suffix = '\n...response capped; narrow the query or request explicit detail.';
    const candidate = text.slice(0, limit - suffix.length);
    const newline = candidate.lastIndexOf('\n');
    return candidate.slice(0, newline > 0 ? newline : candidate.length).trimEnd() + suffix;
}
/** Validate the requested public export graph without executing its modules. */
export async function sourceContract(root: string, implementation: Implementation): Promise<{
    imports: string;
    declarations: string;
    revision: string;
}> {
    return inspectSource(root, implementation, readOwned, hash);
}
function usageSection(markdown: string): string {
    const match = /^## Usage\s*\r?\n([\s\S]*?)(?=^## |$(?![\s\S]))/m.exec(markdown);
    return match?.[1].trim() ?? '';
}
export async function capabilityCard(root: string, snapshot: CatalogSnapshot, id: string, options: {
    framework?: string;
    runtime?: string;
    detail?: Detail;
} = {}): Promise<string> {
    const entry = resolveEntry(snapshot.catalog, id, options);
    const selected = selectImplementations(entry, options.framework, options.runtime);
    if (!selected.length)
        throw new Error(`${entry.id}: unsupported framework/runtime combination`);
    if (selected.length > 1 && options.detail !== 'full')
        return `${entry.id}: ${entry.summary}\nframeworks: ${selected.map(([name]) => name).join(', ')}\nSelect one framework; docs: ${entry.docs}`;
    const sections = [`${entry.id} [${entry.kind}] - ${entry.summary}`, `catalog: ${snapshot.revision}`];
    for (const [framework, impl] of selected) {
        const contract = await sourceContract(root, impl);
        sections.push(`${framework} (source ${contract.revision}):\n${contract.imports}`);
        if (impl.runtimes)
            sections.push(`runtimes: ${impl.runtimes.join(', ')}`);
        if (options.detail === 'api' || options.detail === 'full') {
            sections.push(contract.declarations || `contract: ${impl.source}`);
        }
        if (options.detail === 'usage' || options.detail === 'full') {
            if (impl.example)
                sections.push(`example: ${impl.example}\n${await readOwned(root, impl.example)}`);
            else {
                // Historical docs are React-only. Never attach them to native/Vue/Svelte imports.
                const doc = impl.docs ?? (framework === 'react' ? entry.docs : undefined);
                if (!doc)
                    throw new Error(`USAGE_UNAVAILABLE ${entry.id}/${framework}; inspect its API/source instead`);
                let markdown: string;
                try {
                    markdown = await readOwned(root, doc);
                }
                catch {
                    throw new Error(`DOCS_MISSING ${doc}; restore the version-matched documentation`);
                }
                const usage = usageSection(markdown);
                if (!usage && options.detail === 'usage')
                    throw new Error(`USAGE_UNAVAILABLE ${doc}; request api detail instead`);
                sections.push(options.detail === 'full' ? markdown : usage);
            }
        }
    }
    sections.push(`docs: ${entry.docs}`);
    const text = sections.join('\n');
    return options.detail === undefined || options.detail === 'summary' ? bounded(text) : text;
}
export async function recipeCard(root: string, recipe: CatalogRecipe, framework?: string, example = false): Promise<string> {
    if (framework && !recipe.frameworks.includes(framework))
        throw new Error(`Recipe ${recipe.id} does not support ${framework}`);
    const lines = [`${recipe.id} [${recipe.frameworks.join(',')}] - ${recipe.summary}`, `uses: ${recipe.uses.join(', ')}`];
    const chosen = framework ?? (recipe.frameworks.length === 1 ? recipe.frameworks[0] : undefined);
    if (chosen) {
        const file = recipe.examples[chosen];
        if (!file)
            throw new Error(`Missing ${chosen} example for ${recipe.id}`);
        lines.push(`${chosen} example: ${file}`);
        if (example)
            lines.push(await readOwned(root, file));
    }
    else
        lines.push('Select a framework to retrieve one example.');
    if (recipe.command)
        lines.push(`start: ${recipe.command}`);
    lines.push(`verify: ${recipe.verify}`);
    return example ? lines.join('\n') : bounded(lines.join('\n'));
}
export async function validateCatalog(root: string, snapshot: CatalogSnapshot): Promise<string[]> {
    const errors: string[] = [];
    const { catalog } = snapshot;
    const checkFile = async (file: string) => {
        try {
            await readOwned(root, file);
        }
        catch {
            errors.push(`Missing or unsafe file: ${file}`);
        }
    };
    for (const entry of catalog.entries) {
        await checkFile(entry.docs);
        for (const impl of Object.values(entry.implementations)) {
            if (impl.docs)
                await checkFile(impl.docs);
            if (impl.example)
                await checkFile(impl.example);
            try {
                await sourceContract(root, impl);
                const parts = impl.source.split('/');
                if (parts[0] !== 'packages' || parts.length < 3)
                    throw new Error(`Capability source must be in packages/: ${impl.source}`);
                const manifestDir = parts.slice(0, 2).join('/');
                const manifest = JSON.parse(await readOwned(root, `${manifestDir}/package.json`));
                if (!impl.import.startsWith(`${manifest.name}/`))
                    throw new Error(`Import does not use ${manifest.name}: ${impl.import}`);
                const subpath = `.${impl.import.slice(manifest.name.length)}`;
                let target: unknown = manifest.exports?.[subpath];
                if (!manifest.exports)
                    target = subpath; // Compatibility packages without an exports map.
                if (manifest.exports && target === undefined) {
                    for (const [pattern, value] of Object.entries(manifest.exports)) {
                        if (!pattern.includes('*') || typeof value !== 'string')
                            continue;
                        const [before, after] = pattern.split('*');
                        if (subpath.startsWith(before) && subpath.endsWith(after)) {
                            const wildcard = subpath.slice(before.length, subpath.length - after.length || undefined);
                            target = value.replaceAll('*', wildcard);
                            break;
                        }
                    }
                }
                const targets = (value: unknown): string[] => typeof value === 'string' ? [value] : value && typeof value === 'object' ? Object.values(value).flatMap(targets) : [];
                const candidates = targets(target).flatMap((value) => {
                    const file = path.posix.normalize(`${manifestDir}/${value}`);
                    return manifest.exports ? [file] : [file, `${file}.ts`, `${file}.tsx`, `${file}.js`, `${file}.jsx`, `${file}/index.ts`, `${file}/index.tsx`];
                });
                if (!candidates.includes(impl.source)) {
                    throw new Error(`Import ${impl.import} does not export ${impl.source}`);
                }
            }
            catch (error) {
                errors.push(error instanceof Error ? error.message : String(error));
            }
        }
    }
    const ids = new Set<string>();
    for (const recipe of catalog.recipes) {
        if (ids.has(recipe.id))
            errors.push(`Duplicate recipe: ${recipe.id}`);
        ids.add(recipe.id);
        for (const used of recipe.uses)
            if (!catalog.entries.some((entry) => entry.id === used))
                errors.push(`Unknown capability ${used} in ${recipe.id}`);
        for (const framework of recipe.frameworks) {
            if (!recipe.examples[framework])
                errors.push(`Missing ${framework} example in ${recipe.id}`);
        }
        for (const file of Object.values(recipe.examples))
            await checkFile(file);
    }
    // Retain the original discovery-coverage gates.
    const { readdir } = await import('node:fs/promises');
    for (const directory of ['packages/ui/src/components/ui', 'packages/ui-native/src/components/ui']) {
        for (const filename of await readdir(path.join(root, directory))) {
            const source = `${directory}/${filename}`;
            if (filename.endsWith('.tsx') && !catalog.entries.some((entry) => Object.values(entry.implementations).some((impl) => impl.source === source)))
                errors.push(`Uncataloged UI source: ${source}`);
        }
    }
    for (const section of ['components', 'blocks']) {
        const directory = `apps/tauri-app/content/docs/${section}`;
        const meta = JSON.parse(await readOwned(root, `${directory}/meta.json`)) as {
            pages: string[];
        };
        for (const page of meta.pages.filter((value) => value !== 'index')) {
            const file = `${directory}/${page}.mdx`;
            if (!catalog.entries.some((entry) => entry.docs === file))
                errors.push(`Uncataloged docs: ${file}`);
        }
    }
    return errors;
}
