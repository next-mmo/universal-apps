import { sortNodes } from './nodes';
import type { TreeNode } from './nodes';

/**
 * In-memory demo tree so the viewer can be exercised without native dialogs —
 * useful for first-run UX, offline demos, and automated GUI verification.
 */

const TINY_PNG = Uint8Array.from(atob(
  'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAJUlEQVR4nGP8z8Dwn4EIwESMolG' +
  'FYXThaDaZKZrTaDYThqyWAQCxhwNmpXoYcAAAAABJRU5ErkJggg==',
), (c) => c.charCodeAt(0));

const SVG_SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60" viewBox="0 0 120 60">
  <rect width="120" height="60" rx="8" fill="#0a0a0c"/>
  <circle cx="30" cy="30" r="14" fill="#38bdf8"/>
  <text x="52" y="36" font-family="monospace" font-size="14" fill="#f5f5f7">bfv</text>
</svg>
`;

const README = `# Demo files

This tree is generated in memory so you can try every viewer without
opening a folder from disk.

## What to click

- \`src/app.ts\` — Monaco read-only code view
- \`docs/notes.md\` — rendered markdown (toggle **Source**)
- \`data/table.csv\` — tabular view on TanStack Table
- \`data/config.json\` — pretty JSON
- \`assets/logo.svg\` — image preview (toggle **Source**)
- \`assets/dot.png\` — raster image
- \`assets/sample.pdf\` — embedded PDF viewer
- \`blobs/binary.bin\` — hex dump fallback

Nothing here is uploaded anywhere; the viewer is fully client-side.
`;

const APP_TS = `import { createViewer } from './viewer';

type Kind = 'text' | 'image' | 'binary';

interface Entry {
  path: string;
  size: number;
  kind: Kind;
}

export function route(entry: Entry): string {
  switch (entry.kind) {
    case 'text':
      return \`code:\${entry.path}\`;
    case 'image':
      return \`img:\${entry.path}\`;
    default:
      return \`hex:\${entry.path}\`;
  }
}

const viewer = createViewer({ readOnly: true, minimap: false });
export default viewer;
`;

const NOTES_MD = `# Session notes

## Viewers shipped

1. **Code** — Monaco in read-only mode
2. **Markdown** — sanitized render with source toggle
3. **CSV** — \`ProDataTable\` on TanStack Table v9

## Reminders

- [x] no editing, no saving
- [x] files never leave the browser
- [ ] pick a hosting story

> A viewer, not an IDE.

\`\`\`ts
const theme = prefersDark ? 'dark' : 'light';
\`\`\`
`;

const CONFIG_JSON = `{
  "name": "browser-files-viewer",
  "version": "0.1.0",
  "read_only": true,
  "viewers": ["code", "markdown", "csv", "image", "pdf", "media", "hex"],
  "limits": { "max_text_bytes": 4194304, "csv_rows": 5000 },
  "tanstack": ["router", "query", "store", "table", "virtual"],
  "nested": { "features": { "search": true, "virtual_tree": true } }
}
`;

const TABLE_CSV = `region,item,units,revenue
north,keyboard,120,5400
north,monitor,45,13500
south,keyboard,80,3600
south,mouse,210,4200
east,monitor,62,18600
east,desk mat,150,3000
west,keyboard,95,4275
west,mouse,180,3600
`;

const SMALL_LOG = `2026-09-26T09:00:01Z INFO  viewer boot (client-side only)
2026-09-26T09:00:01Z INFO  theme=dark tokens=universal
2026-09-26T09:00:02Z INFO  virtualized tree ready rows=100000 cap=none
2026-09-26T09:00:03Z WARN  no folder granted yet — demo tree mounted
2026-09-26T09:00:04Z INFO  viewers registered code md csv img pdf media hex
`;

function makeFile(name: string, content: string | Uint8Array, type = 'text/plain'): File {
  return new File([content as BlobPart], name, { type });
}

function node(path: string, kind: 'dir' | 'file', children?: TreeNode[], file?: File): TreeNode {
  const name = path.split('/').pop() ?? path;
  return kind === 'dir'
    ? { path, name, kind, children }
    : {
        path, name, kind, size: file?.size,
        getFile: () => Promise.resolve(file!),
      };
}

const BINARY_BYTES = (() => {
  const bytes = new Uint8Array(64);
  bytes.set([0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01, 0x01, 0x00], 0);
  for (let i = 8; i < bytes.length; i++) bytes[i] = (i * 37 + 11) & 0xff;
  bytes[31] = 0x00;
  return bytes;
})();

/** A minimal but valid one-page PDF. */
function tinyPdf(): File {
  const content = [
    '%PDF-1.4',
    '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj',
    '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj',
    '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 120]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj',
    '4 0 obj<</Length 68>>stream',
    'BT /F1 16 Tf 24 70 Td (Browser Files Viewer demo PDF) Tj ET',
    'endstream endobj',
    '5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj',
    'trailer<</Root 1 0 R/Size 6>>',
    '%%EOF',
  ].join('\n');
  return makeFile('sample.pdf', content, 'application/pdf');
}

export function demoTree(): TreeNode {
  return node('demo-files', 'dir', sortNodes([
    node('demo-files/README.md', 'file', undefined, makeFile('README.md', README, 'text/markdown')),
    node('demo-files/logs', 'dir', sortNodes([
      node('demo-files/logs/viewer.log', 'file', undefined, makeFile('viewer.log', SMALL_LOG)),
    ])),
    node('demo-files/src', 'dir', sortNodes([
      node('demo-files/src/app.ts', 'file', undefined, makeFile('app.ts', APP_TS, 'text/typescript')),
      node('demo-files/src/viewer.ts', 'file', undefined, makeFile('viewer.ts', APP_TS.replace('app', 'viewer'), 'text/typescript')),
    ])),
    node('demo-files/docs', 'dir', sortNodes([
      node('demo-files/docs/notes.md', 'file', undefined, makeFile('notes.md', NOTES_MD, 'text/markdown')),
    ])),
    node('demo-files/data', 'dir', sortNodes([
      node('demo-files/data/table.csv', 'file', undefined, makeFile('table.csv', TABLE_CSV, 'text/csv')),
      node('demo-files/data/config.json', 'file', undefined, makeFile('config.json', CONFIG_JSON, 'application/json')),
    ])),
    node('demo-files/assets', 'dir', sortNodes([
      node('demo-files/assets/logo.svg', 'file', undefined, makeFile('logo.svg', SVG_SAMPLE, 'image/svg+xml')),
      node('demo-files/assets/dot.png', 'file', undefined, makeFile('dot.png', TINY_PNG, 'image/png')),
      node('demo-files/assets/sample.pdf', 'file', undefined, tinyPdf()),
    ])),
    node('demo-files/blobs', 'dir', sortNodes([
      node('demo-files/blobs/binary.bin', 'file', undefined, makeFile('binary.bin', BINARY_BYTES, 'application/octet-stream')),
    ])),
  ]));
}
