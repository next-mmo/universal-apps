import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const appRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.resolve(appRoot, '..', '..');
const docsDir = path.join(appRoot, 'content/docs');
const publicDir = path.join(appRoot, 'public');

interface DocMeta {
  title: string;
  description?: string;
}

interface DocPage extends DocMeta {
  markdown: string;
  publicPath: string;
  sourcePath: string;
}

interface FolderMeta {
  title?: string;
  pages: string[];
}

function parseFrontmatter(raw: string): DocMeta {
  const match = /^---\r?\n([\s\S]+?)\r?\n---/.exec(raw);
  const meta: DocMeta = { title: '' };
  if (match === null) return meta;
  for (const line of match[1].split('\n')) {
    const keyValue = /^(\w[\w-]*):\s*(.*)$/.exec(line.trim());
    if (keyValue === null) continue;
    const value = keyValue[2].replace(/^['"]|['"]$/g, '');
    if (keyValue[1] === 'title') meta.title = value;
    if (keyValue[1] === 'description') meta.description = value;
  }
  return meta;
}

function stripMdx(raw: string): string {
  return raw
    .replace(/^---\r?\n[\s\S]+?\r?\n---\r?\n?/, '')
    .split('\n')
    .filter((line) => !/^import\s|^export\s|^<[A-Z]\w*(Demo)?\s*\/>\s*$/.test(line.trim()))
    .join('\n')
    .trim();
}

async function collectDocs(
  dir: string,
  urlPrefix: string,
  sourcePrefix: string,
  indent: string,
  webLines: string[],
  sourceLines: string[],
  pages: DocPage[],
): Promise<void> {
  const folderMeta: FolderMeta = { pages: [] };
  try {
    Object.assign(folderMeta, JSON.parse(await fs.readFile(path.join(dir, 'meta.json'), 'utf8')));
  } catch {
    folderMeta.pages = (await fs.readdir(dir))
      .filter((file) => file.endsWith('.mdx'))
      .map((file) => file.replace(/\.mdx$/, ''));
  }

  if (folderMeta.title !== undefined && indent !== '') {
    webLines.push(`${indent}- ${folderMeta.title}`);
    sourceLines.push(`${indent}- ${folderMeta.title}`);
  }

  for (const slug of folderMeta.pages) {
    const filePath = path.join(dir, `${slug}.mdx`);
    const nestedDir = path.join(dir, slug);
    const isDirectory = await fs
      .stat(path.join(nestedDir, 'meta.json'))
      .then(() => true)
      .catch(() => false);
    if (isDirectory) {
      await collectDocs(
        nestedDir,
        `${urlPrefix}/${slug}`,
        `${sourcePrefix}/${slug}`,
        `${indent}  `,
        webLines,
        sourceLines,
        pages,
      );
      continue;
    }

    const raw = await fs.readFile(filePath, 'utf8');
    const meta = parseFrontmatter(raw);
    const filename = slug === 'index' ? 'index' : slug;
    const publicPath = `${urlPrefix}/${filename}.md`;
    const sourcePath = `${sourcePrefix}/${slug}.mdx`;
    const suffix = meta.description === undefined ? '' : `: ${meta.description}`;
    webLines.push(`${indent}- [${meta.title}](${publicPath})${suffix}`);
    sourceLines.push(`${indent}- [${meta.title}](${sourcePath})${suffix}`);
    pages.push({ ...meta, markdown: stripMdx(raw), publicPath, sourcePath });
  }
}

function compactIndex(web: boolean): string {
  const agentLinks = web
    ? [
        '- [Agent guide](/docs/agent.md): repository map and task routing',
        '- [Capability catalog](/agent/catalog.json): symbols, implementations, recipes, and examples',
      ]
    : [
        '- [Agent contract](AGENTS.md): mandatory safety and implementation rules',
        '- [Capability catalog](agent/catalog.json): query with `pnpm agent find <capability>`',
        '- [Efficiency baseline](agent/evals.md): repeatable tasks and measurements',
      ];
  return [
    '# Tauri Universal',
    '',
    '> Agent-native Tauri and web application building blocks for React, Vue, Svelte, and React Native Web.',
    '',
    'Retrieve one capability or recipe at a time. Do not load the complete documentation unless explicitly needed.',
    '',
    '## Agent entry points',
    '',
    ...agentLinks,
    '',
    '## Fast path',
    '',
    '```bash',
    'pnpm agent find <intent> --framework react',
    'pnpm agent inspect <id-or-symbol> --framework react',
    'pnpm agent recipe <id> --framework react',
    'pnpm agent check --changed',
    '```',
    '',
    'Add `--full` or `--example` only when the compact response is insufficient.',
    '',
  ].join('\n');
}

function documentationIndex(lines: string[]): string {
  return [
    '# Tauri Universal documentation index',
    '',
    ...lines,
    '',
  ].join('\n');
}

function fullDocument(pages: DocPage[]): string {
  const sections = pages.map((page) => `## ${page.title}\n\nSource: \`${page.sourcePath}\`\n\n${page.markdown}`);
  return [
    '# Tauri Universal — Complete documentation',
    '',
    '> Generated from the checked-in MDX documentation. Prefer `llms.txt` plus one relevant page when possible.',
    '',
    ...sections,
    '',
  ].join('\n\n');
}

async function writeIfChanged(file: string, content: string): Promise<void> {
  const current = await fs.readFile(file, 'utf8').catch(() => undefined);
  if (current === content) return;
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content, 'utf8');
}

async function checkGenerated(files: Array<{ file: string; content: string }>): Promise<void> {
  const stale: string[] = [];
  for (const candidate of files) {
    const current = await fs.readFile(candidate.file, 'utf8').catch(() => undefined);
    if (current !== candidate.content) stale.push(path.relative(repoRoot, candidate.file).replaceAll('\\', '/'));
  }
  if (stale.length > 0) {
    console.error(`STALE ${stale.join(', ')}; run pnpm agent:docs`);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const { values } = parseArgs({ options: { check: { type: 'boolean', default: false } } });
  const webLines: string[] = [];
  const sourceLines: string[] = [];
  const pages: DocPage[] = [];
  await collectDocs(docsDir, '/docs', 'apps/tauri-app/content/docs', '', webLines, sourceLines, pages);

  const rootIndex = compactIndex(false);
  const webIndex = compactIndex(true);
  const docsIndex = documentationIndex(webLines);
  const full = fullDocument(pages);
  const committed = [
    { file: path.join(repoRoot, 'llms.txt'), content: rootIndex },
    { file: path.join(repoRoot, 'llms-full.txt'), content: full },
  ];
  if (values.check) {
    await checkGenerated(committed);
    console.log(`PASS agent docs (${pages.length} pages)`);
    return;
  }

  for (const candidate of committed) await writeIfChanged(candidate.file, candidate.content);
  await writeIfChanged(path.join(publicDir, 'llms.txt'), webIndex);
  await writeIfChanged(path.join(publicDir, 'llms-full.txt'), full);
  await writeIfChanged(path.join(publicDir, 'docs.txt'), docsIndex);
  await writeIfChanged(
    path.join(publicDir, 'agent/catalog.json'),
    await fs.readFile(path.join(repoRoot, 'agent/catalog.json'), 'utf8'),
  );
  for (const page of pages) {
    await writeIfChanged(path.join(publicDir, page.publicPath.replace(/^\//, '')), page.markdown);
  }
  console.log(`PASS agent docs (${pages.length} pages)`);
}

void main();
