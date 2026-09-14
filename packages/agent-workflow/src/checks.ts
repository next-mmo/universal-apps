import { spawn } from 'node:child_process';
import { readFile, realpath, access, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
export interface Command {
    label: string;
    args: string[];
}
export interface Workspace {
    name: string;
    directory: string;
    scripts: Record<string, string>;
    dependencies: string[];
    tsconfig?: boolean;
    /** Verified filesystem classification, not a user-supplied skip flag. */
    metadataOnly?: boolean;
}
export interface CheckPlan {
    mode: 'all' | 'worktree' | 'range';
    metadataOnly: string[];
    paths: string[];
    affected: string[];
    commands: Command[];
    unresolved: string[];
}
export interface CommandResult {
    code: number;
    output: string;
    stdout: string;
    stdoutTruncated: boolean;
    timedOut: boolean;
    error?: string;
}
/** Avoid shell quoting (including on Windows) when pnpm supplies its JS entrypoint. */
export function pnpmInvocation(args: string[]): {
    executable: string;
    args: string[];
} {
    const entry = process.env.npm_execpath;
    if (entry && /pnpm\.(?:c?js|mjs)$/.test(entry))
        return {
            executable: process.execPath, args: [entry, ...args]
        };
    if (process.platform === 'win32')
        throw new Error('Run this command through pnpm so npm_execpath identifies the pnpm JS entrypoint');
    return {
        executable: 'pnpm', args
    };
}
/** Bounded output, explicit errors, and a process-group deadline for hung checks. */
export async function runCommand(executable: string, args: string[], cwd: string, timeoutMs: number): Promise<CommandResult> {
    if (!Number.isInteger(timeoutMs) || timeoutMs < 50)
        throw new Error('timeout must be an integer >= 50 milliseconds');
    return new Promise((resolve) => {
        let output = '';
        let stdout = '';
        let stdoutTruncated = false;
        let timedOut = false;
        let error: string | undefined;
        let closed = false;
        let cleanupComplete = false;
        let settled = false;
        let exitCode: number | null = null;
        let exitSignal: NodeJS.Signals | null = null;
        let force: ReturnType<typeof setTimeout> | undefined;
        let cleanupDeadline: ReturnType<typeof setTimeout> | undefined;
        const child = spawn(executable, args, {
            cwd, shell: false, windowsHide: true, detached: process.platform !== 'win32',
            stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, CI: '1' },
        });
        const append = (data: string) => { output = (output + data).slice(-32000); };
        child.stdout.setEncoding('utf8');
        child.stderr.setEncoding('utf8');
        child.stdout.on('data', (data: string) => {
            append(data);
            stdoutTruncated ||= stdout.length + data.length > 1000000;
            stdout = (stdout + data).slice(-1000000);
        });
        child.stderr.on('data', append);

        function finish(forceClose = false): void {
            if (settled || (!forceClose && (!closed || (timedOut && !cleanupComplete)))) return;
            settled = true;
            clearTimeout(timer);
            if (force) clearTimeout(force);
            if (cleanupDeadline) clearTimeout(cleanupDeadline);
            if (forceClose) {
                child.stdout.destroy();
                child.stderr.destroy();
            }
            resolve({
                code: timedOut ? 124 : exitCode ?? 1, output, stdout, stdoutTruncated, timedOut,
                error: error ?? (exitSignal ? `terminated by ${exitSignal}` : undefined),
            });
        }
        function signalGroup(signal: NodeJS.Signals): void {
            if (!child.pid) return;
            try {
                process.kill(-child.pid, signal);
            } catch (cause) {
                // ESRCH means the entire group has already gone away. Do not fall
                // back to a potentially reused PID after the original parent exits.
                if ((cause as NodeJS.ErrnoException).code !== 'ESRCH') {
                    error = `Process-group cleanup failed: ${String(cause)}`;
                    if (!closed) child.kill(signal);
                }
            }
        }
        const timer = setTimeout(() => {
            timedOut = true;
            // The parent may close before its children. Do not resolve/clear the
            // escalation until tree cleanup completes, even if close fires first.
            cleanupDeadline = setTimeout(() => {
                error ??= 'Timed out waiting for process-tree cleanup';
                if (process.platform !== 'win32') signalGroup('SIGKILL');
                else if (!closed) child.kill('SIGKILL');
                finish(true);
            }, 2000);
            if (process.platform === 'win32' && child.pid) {
                const killer = spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
                    stdio: 'ignore', windowsHide: true,
                });
                killer.on('error', (cause) => { error = `taskkill failed: ${cause.message}`; });
                killer.on('close', (code) => {
                    if (code !== 0) {
                        error ??= `taskkill exited with ${code}; process-tree cleanup not confirmed`;
                        if (!closed) child.kill('SIGKILL');
                    }
                    cleanupComplete = true;
                    finish();
                });
            } else {
                signalGroup('SIGTERM');
                force = setTimeout(() => {
                    signalGroup('SIGKILL');
                    cleanupComplete = true;
                    finish();
                }, 500);
            }
        }, timeoutMs);
        child.on('error', (cause) => { error = cause.message; });
        child.on('close', (code, signal) => {
            closed = true;
            exitCode = code;
            exitSignal = signal;
            finish();
        });
    });
}
export async function runPnpm(args: string[], root: string, timeoutMs = 300000): Promise<CommandResult> {
    const invocation = pnpmInvocation(args);
    return runCommand(invocation.executable, invocation.args, root, timeoutMs);
}
/** Let pnpm interpret workspace globs, exclusions, and nested workspace layouts. */
export async function discoverWorkspaces(root: string): Promise<Workspace[]> {
    const result = await runPnpm(['--recursive', 'list', '--depth', '-1', '--json'], root, 30000);
    if (result.code !== 0)
        throw new Error(`Workspace discovery failed: ${result.error ?? result.output}`);
    let discovered: Array<{
        name?: string;
        path: string;
    }>;
    try {
        if (result.stdoutTruncated)
            throw new Error('Workspace inventory exceeded the output limit');
        discovered = JSON.parse(result.stdout);
    }
    catch {
        throw new Error('pnpm did not return valid workspace JSON; no checks have been skipped');
    }
    if (!Array.isArray(discovered))
        throw new Error('pnpm workspace inventory must be an array');
    const base = await realpath(root);
    const workspaces: Workspace[] = [];
    const names = new Set<string>();
    for (const entry of discovered) {
        const absolute = await realpath(entry.path);
        const directory = path.relative(base, absolute).split(path.sep).join('/');
        if (!directory)
            continue;
        if (directory === '..' || directory.startsWith('../') || path.isAbsolute(directory))
            throw new Error('Workspace outside repository');
        const manifest = JSON.parse(await readFile(path.join(absolute, 'package.json'), 'utf8'));
        if (typeof manifest.name !== 'string' || names.has(manifest.name))
            throw new Error(`Missing or duplicate workspace name: ${directory}`);
        names.add(manifest.name);
        // A private metadata-only placeholder is not an untested implementation.
        // Verify this on every discovery: adding source, scripts, dependencies,
        // export maps or symlinks makes it an ordinary package requiring checks.
        const metadataFields = new Set(['name', 'private', 'version', 'type', 'description', 'license', 'author', 'repository', 'keywords']);
        const metadataFiles = new Set(['package.json', 'README.md', 'LICENSE', 'LICENSE.md', 'NOTICE', 'CHANGELOG.md', '.gitignore']);
        const entries = await readdir(absolute, { withFileTypes: true });
        const metadataOnly = manifest.private === true
            && Object.keys(manifest).every((key) => metadataFields.has(key))
            && entries.every((entry) => (entry.name === 'node_modules' && entry.isDirectory())
                || (metadataFiles.has(entry.name) && entry.isFile()));
        workspaces.push({
            name: manifest.name, directory, scripts: manifest.scripts ?? {}, metadataOnly,
            dependencies: [...new Set<string>([manifest.dependencies, manifest.devDependencies, manifest.peerDependencies, manifest.optionalDependencies].flatMap((group) => Object.keys(group ?? {})))],
            tsconfig: await access(path.join(absolute, 'tsconfig.json')).then(() => true, () => false),
        });
    }
    if (!workspaces.length)
        throw new Error('No workspace packages found; refusing an empty verification plan');
    return workspaces;
}
export function planChecks(workspaces: Workspace[], files: string[], all = false, rootScripts: Record<string, string> = {}): Omit<CheckPlan, 'mode'> {
    const commands: Command[] = [];
    const add = (label: string, args: string[]) => {
        if (!commands.some((command) => JSON.stringify(command.args) === JSON.stringify(args)))
            commands.push({
                label, args
            });
    };
    // Cross-package configuration and themes have consumers not always represented in package.json.
    const global = all || files.some((file) => /^(?:package\.json|pnpm-lock\.yaml|pnpm-workspace\.yaml|tsconfig[^/]*|\.github\/|scripts\/|agent\/|packages\/ui\/src\/(?:styles\/|tokens\.ts))/.test(file));
    const touched = new Set(workspaces.filter((pkg) => global || files.some((file) => file === pkg.directory || file.startsWith(`${pkg.directory}/`))).map((pkg) => pkg.name));
    const affected = new Set(touched);
    let changed = true;
    while (changed) {
        changed = false;
        for (const pkg of workspaces)
            if (!affected.has(pkg.name) && pkg.dependencies.some((dep) => affected.has(dep))) {
                affected.add(pkg.name);
                changed = true;
            }
    }
    for (const name of ['agent:docs:check', 'lint', 'foundation:typecheck', 'foundation:test'])
        if (rootScripts[name])
            add(name, [name]);
    if (global || files.some((file) => /^(?:packages\/(?:cli|mcp|agent-workflow)\/|\.agents\/)/.test(file))) {
        for (const name of ['agent:test', 'mcp:test', 'workflow:check', 'docs:check'])
            if (rootScripts[name])
                add(name, [name]);
    }
    const runnable = new Set<string>();
    for (const pkg of workspaces.filter((workspace) => affected.has(workspace.name))) {
        let count = 0;
        for (const script of ['typecheck', 'test', 'build']) {
            if (pkg.scripts[script]) {
                add(`${pkg.name}:${script}`, ['--dir', pkg.directory, 'run', script]);
                count++;
            }
        }
        if (!pkg.scripts.typecheck && !pkg.scripts.build && pkg.tsconfig) {
            add(`${pkg.name}:types`, ['exec', 'tsc', '--noEmit', '-p', `${pkg.directory}/tsconfig.json`]);
            count++;
        }
        if (count)
            runnable.add(pkg.name);
    }
    const metadataOnly = workspaces.filter((pkg) => affected.has(pkg.name) && pkg.metadataOnly === true).map((pkg) => pkg.name).sort();
    const covered = new Set([...runnable, ...metadataOnly]);
    if (commands.some((command) => command.args[0] === 'mcp:test'))
        covered.add('@package/mcp');
    if (commands.some((command) => command.args[0] === 'agent:test'))
        covered.add('@package/cli');
    changed = true;
    while (changed) {
        changed = false;
        for (const pkg of workspaces.filter((workspace) => covered.has(workspace.name))) {
            for (const dep of pkg.dependencies)
                if (affected.has(dep) && !covered.has(dep)) {
                    covered.add(dep);
                    changed = true;
                }
        }
    }
    const unresolved = [...touched].filter((name) => !covered.has(name));
    // A deleted/new package not yet in pnpm's inventory must not get a false green.
    for (const file of files) {
        if (/^(?:apps|packages)\/.+\/(?:src\/|package\.json$)/.test(file) && !workspaces.some((pkg) => file.startsWith(`${pkg.directory}/`)))
            unresolved.push(`Unowned path: ${file}`);
        if (/\/src-tauri\//.test(file))
            unresolved.push(`Desktop change requires explicit Rust/Tauri validation: ${file}`);
    }
    return {
        paths: files, affected: [...affected].sort(), metadataOnly, commands, unresolved: [...new Set(unresolved)]
    };
}
export async function workspacePlan(root: string, options: {
    all?: boolean;
    base?: string;
    head?: string;
} = {}): Promise<CheckPlan> {
    if (options.head && !options.base)
        throw new Error('--head requires an explicit --base');
    if (options.all && (options.base || options.head))
        throw new Error('--all cannot be combined with a revision range');
    let files: string[] = [];
    if (!options.all) {
        const scopeModule = await import(pathToFileURL(path.join(root, '.agents/scripts/change-scope.mjs')).href);
        const scope = scopeModule.collectChangeScope({
            root, base: options.base ?? 'HEAD', head: options.head ?? 'HEAD'
        });
        if (!Array.isArray(scope.paths?.all))
            throw new Error('Invalid change-scope result');
        files = scope.paths.all;
    }
    const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
    return {
        ...planChecks(await discoverWorkspaces(root), files, options.all, manifest.scripts), mode: options.all ? 'all' : options.base ? 'range' : 'worktree'
    };
}
