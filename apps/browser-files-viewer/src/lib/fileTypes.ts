/** File kind detection and shared formatting for the viewer. */

export type FileKind =
  | 'markdown'
  | 'json'
  | 'csv'
  | 'image'
  | 'pdf'
  | 'video'
  | 'audio'
  | 'text'
  | 'hex';

const IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif']);
const VIDEO_EXTS = new Set(['mp4', 'webm', 'mov', 'm4v', 'ogv']);
const AUDIO_EXTS = new Set(['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'opus']);
const PDF_EXTS = new Set(['pdf']);
const MARKDOWN_EXTS = new Set(['md', 'markdown', 'mdx']);
const JSON_EXTS = new Set(['json', 'jsonc', 'geojson', 'jsonl']);
const CSV_EXTS = new Set(['csv', 'tsv', 'psv']);

const TEXT_EXTS = new Set([
  'txt', 'log', 'ini', 'cfg', 'conf', 'env', 'properties', 'toml', 'yaml', 'yml',
  'xml', 'html', 'htm', 'css', 'scss', 'less', 'graphql', 'gql', 'sql',
  'js', 'mjs', 'cjs', 'jsx', 'ts', 'mts', 'cts', 'tsx', 'vue', 'svelte',
  'py', 'rb', 'php', 'java', 'kt', 'kts', 'scala', 'go', 'rs', 'c', 'h', 'cpp', 'hpp', 'cc', 'cs',
  'swift', 'm', 'mm', 'sh', 'bash', 'zsh', 'fish', 'ps1', 'psm1', 'bat', 'cmd',
  'dart', 'lua', 'r', 'jl', 'ex', 'exs', 'erl', 'hrl', 'hs', 'elm', 'clj', 'cljs', 'groovy',
  'gradle', 'cmake', 'dockerfile', 'makefile', 'gitignore', 'gitattributes', 'editorconfig',
  'npmrc', 'nvmrc', 'babelrc', 'eslintrc', 'prettierrc', 'lock', 'svg', 'aiml', 'htaccess',
]);

/** Files whose extension maps to a Monaco/highlighter language id. */
const EXT_LANGUAGE: Record<string, string> = {
  ts: 'typescript', mts: 'typescript', cts: 'typescript', tsx: 'typescript',
  js: 'javascript', mjs: 'javascript', cjs: 'javascript', jsx: 'javascript',
  vue: 'html', svelte: 'html',
  py: 'python', rb: 'ruby', php: 'php', java: 'java', kt: 'kotlin', kts: 'kotlin',
  scala: 'scala', go: 'go', rs: 'rust', c: 'c', h: 'c', cpp: 'cpp', hpp: 'cpp', cc: 'cpp',
  cs: 'csharp', swift: 'swift', m: 'objective-c', mm: 'objective-c',
  sh: 'shell', bash: 'shell', zsh: 'shell', fish: 'shell',
  ps1: 'powershell', psm1: 'powershell', bat: 'bat', cmd: 'bat',
  dart: 'dart', lua: 'lua', r: 'r', jl: 'julia', ex: 'elixir', exs: 'elixir',
  erl: 'erlang', hrl: 'erlang', hs: 'haskell', elm: 'elm', clj: 'clojure', cljs: 'clojure',
  sql: 'sql', graphql: 'graphql', gql: 'graphql',
  html: 'html', htm: 'html', xml: 'xml', svg: 'xml', vue2: 'html',
  css: 'css', scss: 'scss', less: 'less',
  yaml: 'yaml', yml: 'yaml', toml: 'ini', ini: 'ini', cfg: 'ini', conf: 'ini', properties: 'ini',
  dockerfile: 'dockerfile', makefile: 'makefile', cmake: 'cmake',
  md: 'markdown', markdown: 'markdown', mdx: 'markdown',
  json: 'json', jsonc: 'json', geojson: 'json',
};

export function extensionOf(name: string): string {
  const base = name.toLowerCase();
  if (base === 'dockerfile' || base === 'makefile') return base;
  const dot = base.lastIndexOf('.');
  return dot > 0 ? base.slice(dot + 1) : '';
}

/** Classify by extension. Returns null for unknown extensions — caller should sniff content. */
export function kindFromName(name: string): FileKind | null {
  const ext = extensionOf(name);
  if (IMAGE_EXTS.has(ext)) return 'image';
  if (PDF_EXTS.has(ext)) return 'pdf';
  if (VIDEO_EXTS.has(ext)) return 'video';
  if (AUDIO_EXTS.has(ext)) return 'audio';
  if (MARKDOWN_EXTS.has(ext)) return 'markdown';
  if (JSON_EXTS.has(ext)) return 'json';
  if (CSV_EXTS.has(ext)) return 'csv';
  if (TEXT_EXTS.has(ext) || EXT_LANGUAGE[ext]) return 'text';
  return null;
}

export function languageFor(name: string): string {
  const ext = extensionOf(name);
  if (ext === 'csv' || ext === 'tsv' || ext === 'psv') return 'plaintext';
  return EXT_LANGUAGE[ext] ?? 'plaintext';
}

export function isSvg(name: string): boolean {
  return extensionOf(name) === 'svg';
}

/** Heuristic: treat bytes as binary when they contain a NUL or too many control chars. */
export function looksBinary(bytes: Uint8Array): boolean {
  const sample = bytes.subarray(0, 8192);
  let suspicious = 0;
  for (const b of sample) {
    if (b === 0) return true;
    if (b < 9 || (b > 13 && b < 32)) suspicious++;
  }
  return sample.length > 0 && suspicious / sample.length > 0.06;
}

/** Resolve kind using name first, then content sniff for unknown extensions. */
export function resolveKind(name: string, bytes: Uint8Array | null): FileKind {
  const named = kindFromName(name);
  if (named) return named;
  if (bytes && !looksBinary(bytes)) return 'text';
  return 'hex';
}

export function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '—';
  if (n < 1024) return `${n} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = n;
  let unit = 'B';
  for (const u of units) {
    if (value < 1024) break;
    value /= 1024;
    unit = u;
  }
  return `${value >= 100 ? Math.round(value) : value.toFixed(1)} ${unit}`;
}

/** Text larger than this is read truncated (bytes). */
export const MAX_TEXT_BYTES = 4 * 1024 * 1024;
