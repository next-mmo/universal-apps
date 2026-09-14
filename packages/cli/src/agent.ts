import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { performance } from 'node:perf_hooks';
import { listStarters, planStarter, resolveStarter, writeStarter } from '@package/agent-workflow/init';
import { bounded, capabilityCard, findCapabilities, loadCatalog, readOwned, recipeCard, resolveEntry, selectImplementations, validateCatalog } from '@package/agent-workflow/catalog';
import { runPnpm as runCheck, workspacePlan } from '@package/agent-workflow/checks';
import type { Detail } from '@package/agent-workflow/catalog';
import type { ScaffoldConfig } from './config';
const usage = `usage: pnpm agent <command> [args]
  find [query] [--framework <name>] [--runtime <name>] [--kind <kind>] [--limit <n> | --all] [--json]
  inspect <id-or-symbol> [--framework <name>] [--detail summary|api|usage|full] [--json]
  recipe [id] [--framework <name>] [--example] [--json]
  init [starter] [--out <dir>] [--dry-run] [--json]
  budget [--check] [--json]
  catalog-check
  check [--changed | --base <ref> [--head <ref>] | --all] [--plan] [--json] [--timeout <ms>] [--verbose]
`;
const filterOptions = {
    framework: {
        type: 'string' as const
    }, runtime: {
        type: 'string' as const
    }, kind: {
        type: 'string' as const
    },
    limit: {
        type: 'string' as const
    }, all: {
        type: 'boolean' as const
    }, full: {
        type: 'boolean' as const
    },
    detail: {
        type: 'string' as const
    }, example: {
        type: 'boolean' as const
    }, json: {
        type: 'boolean' as const
    },
};
interface Budgets {
    maxDefaultResponseChars: number;
    files: Record<string, {
        maxBytes?: number;
        maxNonblankLines?: number;
        maxEstimatedTokens?: number;
    }>;
}
export async function agent(config: ScaffoldConfig, args: string[]): Promise<void> {
    const [command, ...rest] = args;
    const root = config.rootDir;
    if (command === undefined) {
        console.log(usage);
        return;
    }
    if (command === 'init') {
        const { positionals, values } = parseArgs({
            args: rest, allowPositionals: true, options: {
                out: {
                    type: 'string'
                }, 'dry-run': {
                    type: 'boolean'
                }, json: {
                    type: 'boolean'
                }
            }
        });
        if (!positionals[0]) {
            console.log(values.json ? JSON.stringify({
                starters: listStarters()
            }) : listStarters().map((starter) => `${starter.id} - ${starter.summary}`).join('\n'));
            return;
        }
        const starter = resolveStarter(positionals[0]);
        if (!starter)
            throw new Error(`Unknown starter ${positionals[0]}`);
        const out = path.resolve(root, values.out ?? `starter-${starter.id}`);
        const plan = await (values['dry-run'] ? planStarter(starter, out) : writeStarter(starter, out));
        console.log(values.json ? JSON.stringify({
            ...plan, dryRun: !!values['dry-run']
        }) : [
            `${plan.id} - ${plan.summary}`, `output: ${plan.output}`, ...plan.files.map((file) => `${file.status.toUpperCase()} ${file.path}`),
            `verify: ${plan.verify.join(' && ')}`, ...(values['dry-run'] ? ['DRY RUN no files written'] : []),
        ].join('\n'));
        return;
    }
    if (command === 'budget') {
        const { values } = parseArgs({
            args: rest, options: {
                check: {
                    type: 'boolean'
                }, quiet: {
                    type: 'boolean'
                }, json: {
                    type: 'boolean'
                }
            }
        });
        const budgets = JSON.parse(await readFile(path.join(root, 'agent/budgets.json'), 'utf8')) as Budgets;
        const results: Array<{
            name: string;
            actual: number;
            limit: number;
            pass: boolean;
        }> = [];
        for (const [file, limits] of Object.entries(budgets.files)) {
            const text = await readOwned(root, file);
            for (const [metric, actual, limit] of [
                ['bytes', Buffer.byteLength(text), limits.maxBytes],
                ['nonblankLines', text.split(/\r?\n/).filter((line) => line.trim()).length, limits.maxNonblankLines],
                ['estimatedTokens', Math.ceil(text.length / 4), limits.maxEstimatedTokens],
            ] as const)
                if (limit !== undefined)
                    results.push({
                        name: `${file}:${metric}`, actual, limit, pass: actual <= limit
                    });
        }
        const snapshot = await loadCatalog(root);
        // Exercise every capability/framework rather than only three hand-picked samples.
        for (const entry of snapshot.catalog.entries)
            for (const framework of Object.keys(entry.implementations)) {
                const actual = (await capabilityCard(root, snapshot, entry.id, {
                    framework
                })).length;
                results.push({
                    name: `${entry.id}/${framework}:chars`, actual, limit: budgets.maxDefaultResponseChars, pass: actual <= budgets.maxDefaultResponseChars
                });
            }
        const pass = results.every((result) => result.pass);
        if (values.json)
            console.log(JSON.stringify({
                results, pass
            }));
        else if (!values.quiet || !pass)
            console.log(results.filter((result) => !values.quiet || !result.pass).map((result) => `${result.pass ? 'PASS' : 'FAIL'} ${result.name} ${result.actual}/${result.limit}`).join('\n'));
        if (values.check && !pass)
            throw new Error('Agent budget exceeded');
        return;
    }
    if (command === 'catalog-check') {
        const errors = await validateCatalog(root, await loadCatalog(root));
        if (errors.length)
            throw new Error(errors.join('\n'));
        console.log('PASS agent catalog (exports, imports, examples, coverage)');
        return;
    }
    if (command === 'check') {
        const { values } = parseArgs({
            args: rest, options: {
                changed: {
                    type: 'boolean'
                }, all: {
                    type: 'boolean'
                }, base: {
                    type: 'string'
                }, head: {
                    type: 'string'
                },
                plan: {
                    type: 'boolean'
                }, json: {
                    type: 'boolean'
                }, timeout: {
                    type: 'string'
                }, verbose: {
                    type: 'boolean'
                },
            }
        });
        if (values.changed && (values.all || values.base || values.head))
            throw new Error('Choose worktree, range, or all scope');
        const plan = await workspacePlan(root, values);
        if (values.plan) {
            console.log(values.json ? JSON.stringify(plan) : [`mode: ${plan.mode}`, ...plan.commands.map((item) => `pnpm ${item.args.join(' ')}`), ...plan.unresolved.map((item) => `UNRESOLVED ${item}`)].join('\n'));
            if (plan.unresolved.length)
                throw new Error('Verification scope has unresolved checks');
            return;
        }
        if (plan.unresolved.length)
            throw new Error(`Verification scope is incomplete:\n${plan.unresolved.join('\n')}`);
        const timeout = values.timeout === undefined ? 300000 : Number(values.timeout);
        if (!Number.isInteger(timeout) || timeout < 50)
            throw new Error('--timeout must be an integer >= 50 milliseconds');
        const started = performance.now();
        const errors = await validateCatalog(root, await loadCatalog(root));
        if (errors.length)
            throw new Error(errors.join('\n'));
        await agent(config, ['budget', '--check', '--quiet']);
        const completed: string[] = [];
        for (const check of plan.commands) {
            const result = await runCheck(check.args, root, timeout);
            if (result.code !== 0)
                throw new Error(`${result.timedOut ? 'TIMEOUT' : 'FAIL'} ${check.label}\n${result.error ?? ''}\n${result.output}`);
            completed.push(check.label);
            if (values.verbose && !values.json)
                console.log(`PASS ${check.label}`);
        }
        console.log(values.json ? JSON.stringify({
            pass: true, mode: plan.mode, completed, seconds: (performance.now() - started) / 1000
        }) : `PASS ${completed.length + 2} checks (${plan.mode}), ${((performance.now() - started) / 1000).toFixed(1)}s`);
        return;
    }
    if (!['find', 'inspect', 'recipe'].includes(command))
        throw new Error(`Unknown agent command ${command}\n${usage}`);
    const { positionals, values } = parseArgs({
        args: rest, allowPositionals: true, options: filterOptions
    });
    const snapshot = await loadCatalog(root);
    if (command === 'find') {
        if (values.all && values.limit)
            throw new Error('Choose --all or --limit');
        const limit = values.limit === undefined ? 5 : Number(values.limit);
        if (!Number.isInteger(limit) || limit < 1)
            throw new Error('--limit must be a positive integer');
        const matches = findCapabilities(snapshot.catalog, positionals.join(' '), values);
        if (!matches.length)
            throw new Error('No capabilities match; try a narrower keyword or omit the runtime filter');
        const visible = matches.slice(0, values.all ? matches.length : limit);
        if (values.json)
            console.log(JSON.stringify({
                revision: snapshot.revision, matches: visible.map(({ id, kind, summary, implementations }) => ({
                    id, kind, summary, frameworks: Object.keys(implementations)
                })), total: matches.length
            }));
        else {
            const text = [...visible.map((entry) => `${entry.id} [${entry.kind}] - ${entry.summary}`), ...(visible.length < matches.length ? [`${matches.length - visible.length} more; pass --all to show them.`] : [])].join('\n');
            console.log(values.all ? text : bounded(text));
        }
    }
    else if (command === 'inspect') {
        if (!positionals[0])
            throw new Error('Specify a capability id or symbol');
        const detail = values.full ? 'full' : values.detail ?? 'summary';
        if (!['summary', 'api', 'usage', 'full'].includes(detail))
            throw new Error('Invalid detail level');
        const text = await capabilityCard(root, snapshot, positionals[0], {
            ...values, detail: detail as Detail
        });
        const entry = resolveEntry(snapshot.catalog, positionals[0]);
        const selected = selectImplementations(entry, values.framework, values.runtime);
        console.log(values.json ? JSON.stringify({
            id: entry.id, kind: entry.kind, summary: entry.summary, docs: entry.docs, ...(detail === 'full' ? {
                implementations: Object.fromEntries(selected)
            } : {}), frameworks: selected.map(([name]) => name), implementation: selected.length === 1 ? selected[0][1] : undefined, revision: snapshot.revision, detail, text
        }) : text);
    }
    else {
        const recipes = snapshot.catalog.recipes.filter((recipe) => (!positionals[0] || recipe.id === positionals[0]) && (!values.framework || recipe.frameworks.includes(values.framework)));
        if (!recipes.length)
            throw new Error('Unknown recipe or unsupported framework');
        if (values.json)
            console.log(JSON.stringify(recipes.map((recipe) => ({
                ...recipe, examples: values.framework ? {
                    [values.framework]: recipe.examples[values.framework]
                } : {}
            }))));
        else
            for (const recipe of recipes)
                console.log(await recipeCard(root, recipe, values.framework, values.example));
    }
}
