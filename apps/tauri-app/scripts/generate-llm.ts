import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const docsDir = path.join(appRoot, 'content/docs');
const publicDir = path.join(appRoot, 'public');

interface DocMeta {
  title: string;
  description?: string;
}

function parseFrontmatter(raw: string): DocMeta {
  const match = /^---\r?\n([\s\S]+?)\r?\n---/.exec(raw);
  const meta: DocMeta = { title: '' };
  if (!match) return meta;
  for (const line of match[1].split('\n')) {
    const kv = /^(\w[\w-]*):\s*(.*)$/.exec(line.trim());
    if (!kv) continue;
    const value = kv[2].replace(/^['"]|['"]$/g, '');
    if (kv[1] === 'title') meta.title = value;
    if (kv[1] === 'description') meta.description = value;
  }
  return meta;
}

function stripMdx(raw: string): string {
  // Remove import/export statements and embedded live-demo components that
  // LLM readers can't act on.
  return raw
    .split('\n')
    .filter((line) => !/^import\s|^export\s|^<[A-Z]\w*(Demo)?\s*\/>\s*$/.test(line.trim()))
    .join('\n');
}

interface FolderMeta {
  title?: string;
  pages: string[];
}

/** Recursively writes per-page .md files; returns llms.txt lines in meta.json order. */
async function walk(dir: string, urlPrefix: string, indent: string, out: string[]): Promise<number> {
  const folderMeta: FolderMeta = { pages: [] };
  try {
    const raw = await fs.readFile(path.join(dir, 'meta.json'), 'utf8');
    Object.assign(folderMeta, JSON.parse(raw));
  } catch {
    // no meta.json — fall back to alphabetical .mdx listing
    folderMeta.pages = (await fs.readdir(dir)).filter((f) => f.endsWith('.mdx')).map((f) => f.replace(/\.mdx$/, ''));
  }

  if (folderMeta.title && indent !== '') {
    out.push(`${indent}- ${folderMeta.title}`);
  }

  let count = 0;
  for (const slug of folderMeta.pages) {
    const filePath = path.join(dir, `${slug}.mdx`);
    const nestedDir = path.join(dir, slug);
    const isDir = await fs
      .stat(path.join(nestedDir, 'meta.json'))
      .then(() => true)
      .catch(() => false);

    if (isDir) {
      count += await walk(nestedDir, `${urlPrefix}/${slug}`, `${indent}  `, out);
      continue;
    }

    const raw = await fs.readFile(filePath, 'utf8');
    const meta = parseFrontmatter(raw);
    const url = slug === 'index' ? urlPrefix || '/docs' : `${urlPrefix}/${slug}`;
    out.push(`${indent}- [${meta.title}](${url})${meta.description ? `: ${meta.description}` : ''}`);

    await fs.mkdir(path.join(publicDir, urlPrefix), { recursive: true });
    await fs.writeFile(
      path.join(publicDir, urlPrefix, `${slug === 'index' ? 'index' : slug}.md`),
      stripMdx(raw),
      'utf8',
    );
    count += 1;
  }
  return count;
}

/** Writes llms.txt + per-page .md into public/ as plain static files. */
async function main() {
  const lines: string[] = [];
  const count = await walk(docsDir, '/docs', '', lines);
  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(path.join(publicDir, 'docs.txt'), ['# Docs', '', ...lines].join('\n'), 'utf8');
  console.log(`[docs-llm] ${count} pages → public/docs.txt + public/docs/**/*.md`);
}

void main();
