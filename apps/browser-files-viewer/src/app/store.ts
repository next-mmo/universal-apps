import { createStore } from '@tanstack/react-store';
import type { TreeNode } from '../lib/nodes';

export interface ViewerState {
  root: TreeNode | null;
  rootLabel: string;
  /** Expanded directory paths. */
  expanded: Set<string>;
  /** Loading/error marker per lazy directory path. */
  dirStatus: Record<string, 'loading' | 'error'>;
  selectedPath: string | null;
  query: string;
  theme: 'dark' | 'light';
  /** Bumped when lazy children are attached so the tree re-renders. */
  version: number;
}

export const viewerStore = createStore<ViewerState>({
  root: null,
  rootLabel: '',
  expanded: new Set<string>(),
  dirStatus: {},
  selectedPath: null,
  query: '',
  theme: (document?.documentElement?.classList.contains('dark') ?? true) ? 'dark' : 'light',
  version: 0,
});

export function setRoot(root: TreeNode | null, label: string): void {
  viewerStore.setState((s) => ({
    ...s,
    root,
    rootLabel: root ? label : '',
    expanded: root ? new Set([root.path]) : new Set(),
    dirStatus: {},
    selectedPath: null,
    query: '',
  }));
}

export function toggleDir(path: string): void {
  viewerStore.setState((s) => {
    const expanded = new Set(s.expanded);
    if (expanded.has(path)) expanded.delete(path);
    else expanded.add(path);
    return { ...s, expanded };
  });
}

export function markDirLoading(path: string, status: 'loading' | 'error' | null): void {
  viewerStore.setState((s) => {
    const dirStatus = { ...s.dirStatus };
    if (status === null) delete dirStatus[path];
    else dirStatus[path] = status;
    return { ...s, dirStatus };
  });
}

/** Expand a directory and all its ancestor chains (used when selecting from search). */
export function expandPath(path: string): void {
  const parts = path.split('/');
  viewerStore.setState((s) => {
    const expanded = new Set(s.expanded);
    for (let i = 1; i < parts.length; i++) expanded.add(parts.slice(0, i).join('/'));
    expanded.add(path);
    return { ...s, expanded };
  });
}

export function selectFile(path: string | null): void {
  viewerStore.setState((s) => ({ ...s, selectedPath: path }));
}

export function setQuery(query: string): void {
  viewerStore.setState((s) => ({ ...s, query }));
}

export function setTheme(theme: 'dark' | 'light'): void {
  viewerStore.setState((s) => ({ ...s, theme }));
  document.documentElement.classList.toggle('dark', theme === 'dark');
}
