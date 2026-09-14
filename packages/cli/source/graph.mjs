import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

export const runtimePackages = ['core', 'utils', 'ui', 'pro-core', 'pro', 'pro-vue', 'pro-svelte', 'ui-native', 'tauri-api'];
const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.vue', '.svelte', '.css', '.json', '.svg'];
const slash = (value) => value.split(path.sep).join('/');
const packageName = (value) => value.startsWith('@') ? value.split('/').slice(0, 2).join('/') : value.split('/')[0];
const slug = (value) => value.replace(/^\.\//, '').replace(/[^a-zA-Z0-9-]+/g, '-').toLowerCase();
const framework = (name) => name === 'pro-vue' ? 'vue' : name === 'pro-svelte' ? 'svelte' : name === 'ui-native' ? 'native' : ['ui', 'pro'].includes(name) ? 'react' : 'shared';
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

function walk(root) {
  return fs.readdirSync(root, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap((entry) => {
    const file = path.join(root, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Source symlinks are not supported: ${file}`);
    return entry.isDirectory() ? walk(file) : [file];
  });
}

function resolveFile(file) {
  const attempts = [file];
  if (/\.[cm]?jsx?$/.test(file)) attempts.push(file.replace(/\.[cm]?jsx?$/, '.ts'), file.replace(/\.[cm]?jsx?$/, '.tsx'));
  if (!path.extname(file)) attempts.push(...sourceExtensions.map((ext) => file + ext), ...sourceExtensions.map((ext) => path.join(file, 'index' + ext)));
  return attempts.find((candidate) => fs.existsSync(candidate) && fs.lstatSync(candidate).isFile());
}

function exportTarget(value) {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const key of ['import', 'browser', 'default', 'types', 'require']) {
      if (value[key] === undefined) continue;
      const target = exportTarget(value[key]);
      if (target) return target;
    }
  }
  throw new Error(`Unsupported package export: ${JSON.stringify(value)}`);
}

/** Read module specifiers without replacing comments, ordinary strings, or JSX text. */
export function moduleReferences(text, filename) {
  const references = [];
  const addScript = (script, offset = 0) => {
    const ast = ts.createSourceFile(filename, script, ts.ScriptTarget.Latest, true, /\.[jt]sx$/.test(filename) ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const add = (node) => {
      if (!node || !ts.isStringLiteralLike(node)) throw new Error(`Non-literal module import is not distributable: ${filename}`);
      references.push({ start: offset + node.getStart(ast) + 1, end: offset + node.getEnd() - 1, value: node.text });
    };
    const visit = (node) => {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) add(node.moduleSpecifier);
      if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) add(node.argument.literal);
      if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) add(node.moduleReference.expression);
      if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) add(node.arguments[0]);
      if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'URL' && node.arguments?.[1]?.getText(ast) === 'import.meta.url' && ts.isStringLiteralLike(node.arguments[0]) && node.arguments[0].text.startsWith('.')) add(node.arguments[0]);
      ts.forEachChild(node, visit);
    };
    visit(ast);
  };
  const addCss = (css, offset = 0) => {
    // Mask comments while retaining offsets. CSS URLs are copied only when local.
    const clean = css.replace(/\/\*[\s\S]*?\*\//g, (s) => ' '.repeat(s.length));
    for (const match of clean.matchAll(/@import\s+(?:url\(\s*)?(["'])([^"']+)\1|url\(\s*(["']?)([^\s)'";]+)\3\s*\)/g)) {
      const value = match[2] ?? match[4];
      if (/^(?:https?:|data:|#|\/)/.test(value)) continue;
      const start = offset + match.index + match[0].indexOf(value);
      if (!references.some((ref) => ref.start === start)) references.push({ start, end: start + value.length, value, css: true });
    }
  };
  if (/\.(vue|svelte)$/.test(filename)) {
    for (const match of text.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi)) addScript(match[1], match.index + match[0].indexOf('>') + 1);
    for (const match of text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi)) addCss(match[1], match.index + match[0].indexOf('>') + 1);
  } else if (filename.endsWith('.css')) addCss(text);
  else if (/\.[cm]?[jt]sx?$/.test(filename)) addScript(text);
  return references.sort((a, b) => a.start - b.start);
}

export function buildRegistry(root, options = {}) {
  root = fs.realpathSync(root);
  const selected = options.packages ?? runtimePackages;
  const rootManifest = readJson(path.join(root, 'package.json'));
  const packages = selected.map((folder) => {
    const directory = path.join(root, 'packages', folder);
    const manifest = readJson(path.join(directory, 'package.json'));
    const source = path.join(directory, 'src');
    // A manifest-only reserved package is part of the inventory, not an installable item.
    // Declared entry points must still resolve; never silently ignore a broken package.
    const files = (fs.existsSync(source) ? walk(source) : []).filter((file) => sourceExtensions.includes(path.extname(file)) && !/(?:^|\/)(?:__tests__|test|tests)\//.test(slash(file)) && !/\.(?:test|spec|stories)\./.test(file));
    if (!fs.existsSync(source) && (manifest.exports || manifest.main || manifest.module)) throw new Error(`Missing source directory for declared entry points: ${folder}`);
    return { folder, directory, source, manifest, files };
  });
  const byName = new Map(packages.map((pkg) => [pkg.manifest.name, pkg]));
  const owner = (file) => {
    const pkg = packages.find((item) => file.startsWith(item.source + path.sep));
    if (!pkg) throw new Error(`Source dependency escapes runtime packages: ${file}`);
    return pkg;
  };
  const relative = (file) => `${owner(file).folder}/${slash(path.relative(owner(file).source, file))}`;
  const nodes = new Map();
  const publicEntries = [];
  const resolveExport = (pkg, subpath) => {
    const exports = pkg.manifest.exports;
    if (exports) {
      if (typeof exports === 'string' || (!Object.keys(exports).some((key) => key.startsWith('.')))) {
        if (subpath === '.') return resolveFile(path.resolve(pkg.directory, exportTarget(exports)));
      } else {
        if (exports[subpath]) return resolveFile(path.resolve(pkg.directory, exportTarget(exports[subpath])));
        for (const [key, value] of Object.entries(exports)) {
          if (!key.includes('*')) continue;
          const [prefix, suffix] = key.split('*');
          if (!subpath.startsWith(prefix) || !subpath.endsWith(suffix)) continue;
          const part = subpath.slice(prefix.length, suffix ? -suffix.length : undefined);
          return resolveFile(path.resolve(pkg.directory, exportTarget(value).replace('*', part)));
        }
      }
    }
    // Source-only packages and existing legacy workspace imports.
    const value = subpath === '.' ? (pkg.manifest.module ?? pkg.manifest.main ?? './src/index.ts') : subpath.startsWith('./src/') ? subpath : `./src/${subpath.slice(2)}`;
    return resolveFile(path.resolve(pkg.directory, value));
  };

  for (const pkg of packages) {
    const exports = pkg.manifest.exports;
    if (exports && typeof exports === 'object' && Object.keys(exports).some((key) => key.startsWith('.'))) {
      for (const [key, value] of Object.entries(exports)) {
        if (key.startsWith('./src/')) continue;
        const target = exportTarget(value);
        if (key.includes('*')) {
          const [prefix, suffix] = target.split('*');
          for (const file of pkg.files) {
            const local = './' + slash(path.relative(pkg.directory, file));
            if (local.startsWith(prefix) && local.endsWith(suffix)) {
              const match = local.slice(prefix.length, suffix ? -suffix.length : undefined);
              publicEntries.push({ pkg, name: `${pkg.folder}-${slug(key.replace('*', match))}`, file });
            }
          }
        } else {
          const file = resolveExport(pkg, key);
          if (!file) throw new Error(`Missing public export ${pkg.manifest.name}/${key}`);
          publicEntries.push({ pkg, name: key === '.' ? `${pkg.folder}-index` : `${pkg.folder}-${slug(key)}`, file });
        }
      }
    } else if (exports) {
      const file = resolveExport(pkg, '.');
      if (!file) throw new Error(`Missing public export ${pkg.manifest.name}`);
      publicEntries.push({ pkg, name: `${pkg.folder}-index`, file });
    } else {
      // Framework adapters without an exports map are still fully source-distributable.
      if ((pkg.manifest.main || pkg.manifest.module) && !resolveExport(pkg, '.')) throw new Error(`Missing public export ${pkg.manifest.name}`);
      for (const file of pkg.files.filter((file) => !file.endsWith('.d.ts'))) {
        publicEntries.push({ pkg, name: `${pkg.folder}-${slug(slash(path.relative(pkg.source, file)).replace(/\.[^.]+$/, ''))}`, file });
      }
    }
  }

  function load(file) {
    file = fs.realpathSync(file);
    if (nodes.has(file)) return nodes.get(file);
    const pkg = owner(file);
    const original = fs.readFileSync(file, 'utf8');
    if (original.includes('\0')) throw new Error(`Binary assets need an explicit distribution strategy: ${file}`);
    const node = { file, path: relative(file), content: original, dependencies: {}, edges: new Set() };
    nodes.set(file, node); // Cycles are valid module graphs.
    const edits = [];
    for (const ref of moduleReferences(original, file)) {
      let target;
      if (ref.value.startsWith('.')) target = resolveFile(path.resolve(path.dirname(file), ref.value));
      else if (byName.has(packageName(ref.value))) {
        const name = packageName(ref.value);
        target = resolveExport(byName.get(name), ref.value === name ? '.' : '.' + ref.value.slice(name.length));
      } else {
        if (ref.value.startsWith('@package/') || ref.value.startsWith('@/') || ref.value.startsWith('~/') || ref.value.startsWith('#') || path.isAbsolute(ref.value)) throw new Error(`Unresolved local import ${ref.value} in ${relative(file)}`);
        if (ref.value.startsWith('node:')) throw new Error(`Node-only module in a client registry: ${relative(file)}`);
        const name = packageName(ref.value);
        const version = pkg.manifest.dependencies?.[name] ?? pkg.manifest.peerDependencies?.[name] ?? pkg.manifest.devDependencies?.[name] ?? rootManifest.dependencies?.[name] ?? rootManifest.devDependencies?.[name];
        if (!version || /^(?:workspace|file|link):/.test(version)) throw new Error(`Missing portable dependency version for ${ref.value} in ${relative(file)}`);
        node.dependencies[name] = version;
        continue;
      }
      if (!target) throw new Error(`Unresolved module ${ref.value} in ${relative(file)}`);
      const child = load(target);
      node.edges.add(child.file);
      let specifier = slash(path.posix.relative(path.posix.dirname(node.path), child.path));
      if (!specifier.startsWith('.')) specifier = './' + specifier;
      if (/\.tsx?$/.test(specifier)) specifier = specifier.replace(/\.tsx?$/, /\.[cm]?jsx?$/.test(ref.value) ? path.extname(ref.value) : '');
      edits.push({ ...ref, value: specifier });
    }
    for (const edit of edits.reverse()) node.content = node.content.slice(0, edit.start) + edit.value + node.content.slice(edit.end);
    return node;
  }

  const license = fs.readFileSync(path.join(root, 'LICENSE'), 'utf8');
  function item(name, pkg, entries) {
    const closure = new Map();
    const visit = (file) => {
      const node = load(file);
      if (closure.has(node.file)) return;
      closure.set(node.file, node);
      for (const edge of node.edges) visit(edge);
    };
    for (const entry of entries) visit(entry);
    if (['ui', 'pro', 'pro-vue', 'pro-svelte'].includes(pkg.folder) || [...closure.values()].some((node) => node.path.startsWith('ui/components/'))) {
      const tokens = path.join(root, 'packages/ui/src/styles/tokens.css');
      if (fs.existsSync(tokens) && byName.has('@package/ui')) visit(tokens);
    }
    const dependencies = {};
    for (const node of closure.values()) {
      for (const [name, version] of Object.entries(node.dependencies)) {
        if (dependencies[name] && dependencies[name] !== version) throw new Error(`Conflicting ${name} versions in ${pkg.folder}: ${dependencies[name]} vs ${version}`);
        dependencies[name] = version;
      }
    }
    const files = [...closure.values()].sort((a, b) => a.path.localeCompare(b.path)).map((node) => ({ path: `registry/${node.path}`, type: 'registry:file', target: `@lib/universal/${node.path}`, content: node.content }));
    files.push({ path: 'registry/LICENSE', type: 'registry:file', target: '@lib/universal/LICENSE', content: license });
    return {
      $schema: 'https://ui.shadcn.com/schema/registry-item.json',
      name, type: 'registry:block', title: name, description: `Editable ${pkg.folder} source with its complete local dependency graph.`,
      dependencies: Object.entries(dependencies).sort(([a], [b]) => a.localeCompare(b)).map(([name, version]) => `${name}@${version}`),
      files,
      meta: { framework: framework(pkg.folder), package: pkg.folder, entries: entries.map(relative), sourceOwned: true },
      docs: 'Source is installed locally; no @package/* runtime dependency is required. For web styles, import the generated ui/styles/tokens.css into your Tailwind v4 stylesheet. Native adapters still need their normal platform configuration.',
    };
  }
  const items = publicEntries.map(({ pkg, name, file }) => item(name, pkg, [file]));
  const emptyPackages = [];
  for (const pkg of packages) {
    const entries = publicEntries.filter((entry) => entry.pkg === pkg).map((entry) => entry.file);
    if (!entries.length) {
      if (pkg.files.length || pkg.manifest.exports || pkg.manifest.main || pkg.manifest.module) throw new Error(`No distributable entry points in ${pkg.folder}`);
      emptyPackages.push(pkg.manifest.name);
      continue;
    }
    items.push(item(pkg.folder, pkg, entries));
  }
  if (new Set(items.map((item) => item.name)).size !== items.length) throw new Error('Registry item name collision');
  return { schemaVersion: 1, version: rootManifest.version ?? '0.1.0', packages: packages.map((pkg) => pkg.manifest.name), emptyPackages, publicEntryCount: publicEntries.length, items: items.sort((a, b) => a.name.localeCompare(b.name)) };
}
