/** Unified tree node model for all file sources (FS Access API, drops, demo). */
export interface TreeNode {
  /** Stable id — the '/'-joined path relative to the root. */
  path: string;
  name: string;
  kind: 'dir' | 'file';
  /** Known upfront for in-memory files; resolved lazily for FS Access files. */
  size?: number;
  children?: TreeNode[];
  /** Present on lazy directories (File System Access API roots). */
  loadChildren?: () => Promise<TreeNode[]>;
  /** Present on files. */
  getFile?: () => Promise<File>;
}

export function sortNodes(nodes: TreeNode[]): TreeNode[] {
  return [...nodes].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });
}
