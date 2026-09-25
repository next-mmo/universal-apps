import { describe, expect, it } from 'vitest';
import { hexDump } from './hex';
import { filterTree, ancestorsOf } from './treeFilter';
import { demoTree } from './demo';
import { treeFromFileList } from './fsAccess';
import type { TreeNode } from './nodes';

describe('hexDump', () => {
  it('produces 16-wide rows with offsets and ascii', () => {
    const bytes = new Uint8Array(20);
    bytes.set([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x00, 0x02], 0); // "Hello" + NUL + ctrl
    const rows = hexDump(bytes);
    expect(rows).toHaveLength(2);
    expect(rows[0].offset).toBe(0);
    expect(rows[0].hex[0]).toBe('48');
    expect(rows[0].ascii.startsWith('Hello')).toBe(true);
    expect(rows[0].ascii[5]).toBe('.');
    expect(rows[1].offset).toBe(16);
    expect(rows[1].hex.filter((h) => h !== '  ')).toHaveLength(4);
  });

  it('caps at maxBytes', () => {
    expect(hexDump(new Uint8Array(10_000), 4096)).toHaveLength(256);
  });
});

describe('filterTree', () => {
  const tree: TreeNode[] = [
    {
      path: 'src', name: 'src', kind: 'dir',
      children: [
        { path: 'src/app.ts', name: 'app.ts', kind: 'file' },
        { path: 'src/util.ts', name: 'util.ts', kind: 'file' },
      ],
    },
    { path: 'README.md', name: 'README.md', kind: 'file' },
  ];

  it('keeps ancestor chains of matching files', () => {
    const out = filterTree(tree, 'app');
    expect(out).toHaveLength(1);
    expect(out[0].name).toBe('src');
    expect(out[0].children).toEqual([tree[0].children![0]]);
  });

  it('keeps directories whose own name matches, without forcing children', () => {
    const out = filterTree(tree, 'src');
    expect(out).toHaveLength(1);
    expect(out[0].children).toBeUndefined();
  });

  it('is case-insensitive and ignores empty queries', () => {
    expect(filterTree(tree, 'readme')).toHaveLength(1);
    expect(filterTree(tree, '  ')).toBe(tree);
  });
});

describe('ancestorsOf', () => {
  it('lists parent chains', () => {
    expect(ancestorsOf('a/b/c.txt')).toEqual(['a', 'a/b']);
    expect(ancestorsOf('root.txt')).toEqual([]);
  });
});

describe('demoTree', () => {
  it('builds a sorted tree with file loaders', async () => {
    const root = demoTree();
    expect(root.kind).toBe('dir');
    const names = root.children!.map((c) => c.name);
    // Directories sort before files, each alphabetical.
    expect(names).toEqual(['assets', 'blobs', 'data', 'docs', 'logs', 'src', 'README.md']);
    const src = root.children!.find((c) => c.name === 'src')!;
    const app = src.children!.find((c) => c.name === 'app.ts')!;
    const file = await app.getFile!();
    expect(file.name).toBe('app.ts');
    expect(file.size).toBeGreaterThan(0);
  });
});

describe('treeFromFileList', () => {
  const makeFile = (rel: string) => {
    const name = rel.split('/').pop()!;
    const f = new File(['x'], name);
    Object.defineProperty(f, 'webkitRelativePath', { value: rel });
    return f as File;
  };

  it('nests by webkitRelativePath below the root segment', () => {
    const root = treeFromFileList('proj', [
      makeFile('proj/src/app.ts'),
      makeFile('proj/src/lib/util.ts'),
      makeFile('proj/README.md'),
    ]);
    expect(root.name).toBe('proj');
    const src = root.children!.find((c) => c.name === 'src')!;
    expect(src.kind).toBe('dir');
    expect(src.children!.map((c) => c.name)).toEqual(['lib', 'app.ts']);
    const lib = src.children!.find((c) => c.name === 'lib')!;
    expect(lib.children![0].name).toBe('util.ts');
  });
});
