import { sortNodes } from './nodes';
import type { TreeNode } from './nodes';

/** File System Access API access layer — lazy directory handles, read-only. */

interface DirHandleLike {
  kind: 'directory';
  name: string;
  values: () => AsyncIterableIterator<DirHandleLike | FileHandleLike>;
}

interface FileHandleLike {
  kind: 'file';
  name: string;
  getFile: () => Promise<File>;
}

export function supportsFsAccess(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

/** Open the OS folder picker; returns the root node or null when cancelled. */
export async function pickDirectory(): Promise<TreeNode | null> {
  const picker = (window as unknown as {
    showDirectoryPicker?: (options?: { mode?: string }) => Promise<DirHandleLike>;
  }).showDirectoryPicker;
  if (!picker) throw new Error('File System Access API is not available in this browser.');
  let handle: DirHandleLike;
  try {
    handle = await picker({ mode: 'read' });
  } catch (err) {
    // User cancelled the picker — not an error.
    if (err instanceof DOMException && (err.name === 'AbortError' || err.name === 'NotAllowedError')) return null;
    throw err;
  }
  return dirNode(handle, '');
}

function dirNode(handle: DirHandleLike, parentPath: string): TreeNode {
  const path = parentPath ? `${parentPath}/${handle.name}` : handle.name;
  return {
    path,
    name: handle.name,
    kind: 'dir',
    loadChildren: async () => {
      const children: TreeNode[] = [];
      for await (const entry of handle.values()) {
        if (entry.kind === 'directory') children.push(dirNode(entry, path));
        else children.push(fileNode(entry, path));
      }
      return sortNodes(children);
    },
  };
}

function fileNode(handle: FileHandleLike, parentPath: string): TreeNode {
  const path = parentPath ? `${parentPath}/${handle.name}` : handle.name;
  return {
    path,
    name: handle.name,
    kind: 'file',
    getFile: () => handle.getFile(),
  };
}

/**
 * Build a fully materialized tree from a File list with relative paths
 * (drag-and-drop items and `webkitdirectory` input files).
 */
export function treeFromFileList(rootName: string, files: File[]): TreeNode {
  interface DirAccumulator { dirs: Map<string, DirAccumulator>; files: TreeNode[] }
  const root: DirAccumulator = { dirs: new Map(), files: [] };
  const dirFor = (acc: DirAccumulator, segs: string[]): DirAccumulator => {
    if (segs.length === 0) return acc;
    const [head, ...rest] = segs;
    let child = acc.dirs.get(head);
    if (!child) { child = { dirs: new Map(), files: [] }; acc.dirs.set(head, child); }
    return dirFor(child, rest);
  };

  for (const file of files) {
    // webkitRelativePath is "rootName/a/b/file.txt"; drop the first segment.
    const rel = (file as File & { webkitRelativePath?: string }).webkitRelativePath ?? '';
    const segs = rel ? rel.split('/').slice(1, -1) : [];
    const acc = dirFor(root, segs);
    acc.files.push({
      path: [rootName, ...segs, file.name].filter(Boolean).join('/'),
      name: file.name,
      kind: 'file',
      size: file.size,
      getFile: () => Promise.resolve(file),
    });
  }

  const toNode = (name: string, acc: DirAccumulator, parentPath: string): TreeNode => {
    const path = parentPath ? `${parentPath}/${name}` : name;
    const children = [
      ...[...acc.dirs.entries()].map(([childName, childAcc]) => toNode(childName, childAcc, path)),
      ...acc.files,
    ];
    return { path, name, kind: 'dir', children: sortNodes(children) };
  };

  return toNode(rootName, root, '');
}

interface FileSystemEntryLike {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  file?: (cb: (file: File) => void, err?: (e: unknown) => void) => void;
  createReader?: () => { readEntries: (cb: (entries: FileSystemEntryLike[]) => void, err?: (e: unknown) => void) => void };
  fullPath?: string;
}

/** Read every entry from a directory entry reader (readEntries paginates). */
async function readAllEntries(dir: FileSystemEntryLike): Promise<FileSystemEntryLike[]> {
  const reader = dir.createReader?.();
  if (!reader) return [];
  const all: FileSystemEntryLike[] = [];
  for (;;) {
    const batch = await new Promise<FileSystemEntryLike[]>((resolve, reject) => {
      reader.readEntries(
        (entries) => resolve(entries),
        (err) => reject(err),
      );
    });
    if (batch.length === 0) break;
    all.push(...batch);
  }
  return all;
}

function entryToNode(entry: FileSystemEntryLike, parentPath: string): Promise<TreeNode> {
  const path = parentPath ? `${parentPath}/${entry.name}` : entry.name;
  if (entry.isDirectory) {
    return (async () => {
      const children = await readAllEntries(entry);
      const nodes = await Promise.all(children.map((child) => entryToNode(child, path)));
      return { path, name: entry.name, kind: 'dir', children: sortNodes(nodes) };
    })();
  }
  return new Promise<TreeNode>((resolve, reject) => {
    entry.file?.(
      (file) => resolve({
        path, name: entry.name, kind: 'file', size: file.size,
        getFile: () => Promise.resolve(file),
      }),
      reject,
    );
    if (!entry.file) reject(new Error(`Cannot read ${entry.name}`));
  });
}

/** Convert dropped items (with webkitGetAsEntry) into a tree; multi-file drops become a virtual root. */
export async function treeFromDataTransfer(items: DataTransferItemList, fallbackFiles: File[]): Promise<TreeNode> {
  const entries: FileSystemEntryLike[] = [];
  for (const item of Array.from(items)) {
    const entry = (item as DataTransferItem & { webkitGetAsEntry?: () => FileSystemEntryLike | null }).webkitGetAsEntry?.();
    if (entry) entries.push(entry);
  }
  if (entries.length === 0) return treeFromFileList('dropped-files', fallbackFiles);

  if (entries.length === 1 && entries[0].isDirectory) {
    return entryToNode(entries[0], '');
  }
  const nodes = await Promise.all(entries.map((entry) => entryToNode(entry, '')));
  return { path: 'dropped-items', name: 'Dropped items', kind: 'dir', children: sortNodes(nodes) };
}
