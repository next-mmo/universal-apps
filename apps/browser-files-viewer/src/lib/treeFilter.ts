import type { TreeNode } from './nodes';

/**
 * Filter a tree by a case-insensitive substring query. A directory survives
 * when it or any descendant matches; matching files keep their ancestor chain.
 */
export function filterTree(nodes: TreeNode[], query: string): TreeNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;
  const out: TreeNode[] = [];
  for (const node of nodes) {
    if (node.kind === 'dir') {
      const children = node.children ? filterTree(node.children, query) : undefined;
      const hasMatches = children != null && children.length > 0;
      if (hasMatches || node.name.toLowerCase().includes(q)) {
        out.push({
          ...node,
          children: hasMatches ? children : undefined,
          // Keep lazy expansion alive when only the directory name matched.
          loadChildren: hasMatches ? undefined : node.loadChildren,
        });
      }
    } else if (node.name.toLowerCase().includes(q)) {
      out.push(node);
    }
  }
  return out;
}

/** True when any node in the path chain is not expanded yet. */
export function ancestorsOf(path: string): string[] {
  const parts = path.split('/');
  const chains: string[] = [];
  for (let i = 1; i < parts.length; i++) chains.push(parts.slice(0, i).join('/'));
  return chains;
}
