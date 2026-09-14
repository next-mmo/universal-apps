import { realpathSync, statSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { Implementation } from './catalog.ts';
import type * as TypeScript from 'typescript';

type ExportInfo = { type: boolean; text?: string; origin: string };
type Reference = { name: string; module?: string; typeOnly?: boolean };
type Binding = ExportInfo | Reference;
type ModuleInfo = {
  locals: Map<string, Binding>;
  exports: Map<string, Binding>;
  stars: Array<{ module: string; typeOnly: boolean }>;
  source: string;
};

/** Resolve only public export edges, never execute modules or scan entire packages. */
export async function inspectSource(
  root: string,
  implementation: Implementation,
  readOwned: (root: string, relative: string) => Promise<string>,
  hash: (source: string) => string,
): Promise<{ imports: string; declarations: string; revision: string }> {
  const ts = await import('typescript');
  const base = realpathSync(root);
  const modules = new Map<string, ModuleInfo>();
  const maxModules = 128;
  const identifier = /^[A-Za-z_$][\w$]*$/;

  function withinRoot(file: string): string | undefined {
    try {
      const actual = realpathSync(file);
      const relative = path.relative(base, actual);
      return relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)
        ? undefined : actual;
    } catch { return undefined; }
  }
  // TypeScript's resolver may walk up parent directories. Bound its metadata
  // reads too, not only the final source read (including symlinked packages).
  const host: TypeScript.ModuleResolutionHost = {
    fileExists(file) {
      const actual = withinRoot(file);
      return actual !== undefined && statSync(actual).isFile();
    },
    readFile(file) {
      const actual = withinRoot(file);
      return actual === undefined ? undefined : readFileSync(actual, 'utf8');
    },
    directoryExists(dir) {
      const actual = withinRoot(dir);
      return actual !== undefined && statSync(actual).isDirectory();
    },
    realpath: (file) => withinRoot(file) ?? file,
  };

  function resolveModule(from: string, specifier: string): string {
    // Framework components are compiled by their framework, not TypeScript.
    if (specifier.startsWith('.') && /\.(?:vue|svelte)$/.test(specifier)) {
      const relative = path.posix.normalize(path.posix.join(path.posix.dirname(from), specifier));
      const actual = withinRoot(path.join(base, relative));
      if (actual) return path.relative(base, actual).split(path.sep).join('/');
    }
    const resolved = ts.resolveModuleName(specifier, path.join(base, from), {
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      allowJs: true,
    }, host).resolvedModule;
    const actual = resolved && withinRoot(resolved.resolvedFileName);
    if (!actual) throw new Error(`Cannot resolve export target ${JSON.stringify(specifier)} from ${from} within workspace`);
    return path.relative(base, actual).split(path.sep).join('/');
  }

  function parse(file: string, source: string): TypeScript.SourceFile {
    // Omitting ScriptKind lets TS infer .ts/.tsx/.js/.jsx/.mts/.cts correctly.
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    const diagnostics = (ast as TypeScript.SourceFile & { parseDiagnostics: readonly TypeScript.Diagnostic[] }).parseDiagnostics;
    if (diagnostics.length) {
      throw new Error(`Invalid source ${file}: ${ts.flattenDiagnosticMessageText(diagnostics[0].messageText, ' ')}`);
    }
    return ast;
  }

  async function load(file: string): Promise<ModuleInfo> {
    const cached = modules.get(file);
    if (cached) return cached;
    if (modules.size >= maxModules) throw new Error(`Export graph exceeds ${maxModules} modules; narrow the capability`);
    const source = await readOwned(base, file);
    const info: ModuleInfo = { locals: new Map(), exports: new Map(), stars: [], source };
    modules.set(file, info);
    if (/\.(?:vue|svelte)$/.test(file)) {
      info.exports.set('default', { type: false, origin: `${file}:default` });
      return info;
    }
    const ast = parse(file, source);
    const has = (node: TypeScript.Node, kind: TypeScript.SyntaxKind) =>
      ts.canHaveModifiers(node) && ts.getModifiers(node)?.some((modifier) => modifier.kind === kind);
    function local(name: string, type: boolean, node: TypeScript.Node): void {
      const value: ExportInfo = {
        type, origin: `${file}:${name}`,
        text: type ? node.getText(ast).replace(/^export\s+(?:default\s+)?/, '') : undefined,
      };
      info.locals.set(name, value);
      if (has(node, ts.SyntaxKind.ExportKeyword)) {
        info.exports.set(has(node, ts.SyntaxKind.DefaultKeyword) ? 'default' : name, value);
      }
    }
    for (const node of ast.statements) {
      if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isClassDeclaration(node)
        || ts.isFunctionDeclaration(node) || ts.isEnumDeclaration(node) || ts.isModuleDeclaration(node)) {
        if (node.name) local(node.name.text, ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node), node);
        else if (has(node, ts.SyntaxKind.DefaultKeyword)) info.exports.set('default', { type: false, origin: `${file}:default` });
      } else if (ts.isVariableStatement(node)) {
        const addNames = (name: TypeScript.BindingName): void => {
          if (ts.isIdentifier(name)) local(name.text, false, node);
          else for (const element of name.elements) if (ts.isBindingElement(element)) addNames(element.name);
        };
        for (const declaration of node.declarationList.declarations) addNames(declaration.name);
      } else if (ts.isImportDeclaration(node) && node.importClause && ts.isStringLiteral(node.moduleSpecifier)) {
        const clause = node.importClause;
        const module = node.moduleSpecifier.text;
        if (clause.name) info.locals.set(clause.name.text, { name: 'default', module, typeOnly: clause.isTypeOnly });
        if (clause.namedBindings) {
          if (ts.isNamespaceImport(clause.namedBindings)) info.locals.set(clause.namedBindings.name.text, { name: '*', module, typeOnly: clause.isTypeOnly });
          else for (const item of clause.namedBindings.elements) {
            info.locals.set(item.name.text, { name: item.propertyName?.text ?? item.name.text, module, typeOnly: clause.isTypeOnly || item.isTypeOnly });
          }
        }
      } else if (ts.isExportDeclaration(node)) {
        const module = node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier) ? node.moduleSpecifier.text : undefined;
        if (node.exportClause && ts.isNamedExports(node.exportClause)) {
          for (const item of node.exportClause.elements) {
            info.exports.set(item.name.text, { name: item.propertyName?.text ?? item.name.text, module, typeOnly: node.isTypeOnly || item.isTypeOnly });
          }
        } else if (node.exportClause && ts.isNamespaceExport(node.exportClause) && module) {
          info.exports.set(node.exportClause.name.text, { name: '*', module, typeOnly: node.isTypeOnly });
        } else if (module) info.stars.push({ module, typeOnly: node.isTypeOnly });
      } else if (ts.isExportAssignment(node) && !node.isExportEquals) {
        info.exports.set('default', ts.isIdentifier(node.expression)
          ? { name: node.expression.text } : { type: false, origin: `${file}:default` });
      }
    }
    return info;
  }

  async function resolve(file: string, name: string, seen = new Set<string>(), localOnly = false): Promise<ExportInfo | undefined> {
    const key = `${file}:${localOnly ? 'local' : 'export'}:${name}`;
    if (seen.has(key)) return undefined; // A star-export cycle is not an implementation.
    if (seen.size >= 64) throw new Error('Export chain exceeds 64 steps');
    const next = new Set(seen).add(key);
    const info = await load(file);
    const binding = (localOnly ? info.locals : info.exports).get(name);
    if (binding) {
      if ('origin' in binding) return binding;
      if (binding.module) {
        const target = resolveModule(file, binding.module);
        if (binding.name === '*') {
          await load(target);
          return { type: !!binding.typeOnly, origin: `${target}:*` };
        }
        const found = await resolve(target, binding.name, next);
        if (!found) throw new Error(`Export ${binding.name} is absent from ${target} (referenced by ${file})`);
        return { ...found, type: !!binding.typeOnly || found.type };
      }
      const found = await resolve(file, binding.name, next, true);
      if (!found) throw new Error(`Export ${name} references missing local ${binding.name} in ${file}`);
      return { ...found, type: !!binding.typeOnly || found.type };
    }
    if (localOnly || name === 'default') return undefined;
    let found: ExportInfo | undefined;
    for (const star of info.stars) {
      const match = await resolve(resolveModule(file, star.module), name, next);
      if (!match) continue;
      if (found && found.origin !== match.origin) throw new Error(`Ambiguous star export ${name} in ${file}`);
      found = { ...match, type: star.typeOnly || match.type };
    }
    return found;
  }

  const values: string[] = [];
  const types: string[] = [];
  const declarations: string[] = [];
  let defaultName = '';
  let defaultType = false;
  for (const name of implementation.exports) {
    if (!identifier.test(name)) throw new Error(`Invalid export identifier: ${name}`);
    const info = await resolve(implementation.source, name);
    if (!info) throw new Error(`Catalog export ${name} is absent from ${implementation.source}`);
    if (name === 'default') {
      defaultName = implementation.defaultExport ?? path.basename(implementation.source).split('.')[0].split('-').map((part) => part[0]?.toUpperCase() + part.slice(1)).join('');
      defaultType = info.type;
      if (!identifier.test(defaultName) || defaultName === 'default') throw new Error('Invalid default import name');
    } else (info.type ? types : values).push(name);
    if (info.text) declarations.push(info.text);
  }
  const imports: string[] = [];
  const specifier = JSON.stringify(implementation.import);
  if (defaultName && defaultType) imports.push(`import type ${defaultName} from ${specifier};`);
  if (values.length || (defaultName && !defaultType)) {
    imports.push(`import ${[defaultType ? '' : defaultName, values.length ? `{ ${values.join(', ')} }` : ''].filter(Boolean).join(', ')} from ${specifier};`);
  }
  if (types.length) imports.push(`import type { ${types.join(', ')} } from ${specifier};`);
  parse('catalog-import.ts', imports.join('\n'));
  return {
    imports: imports.join('\n'), declarations: [...new Set(declarations)].join('\n\n'),
    // Include resolved export dependencies, so a transitive change invalidates a card.
    revision: hash([...modules].sort(([a], [b]) => a.localeCompare(b)).map(([file, info]) => `${file}\0${hash(info.source)}`).join('\n')),
  };
}
