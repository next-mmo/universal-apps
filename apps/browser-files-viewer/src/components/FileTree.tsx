import { useVirtualizer } from '@tanstack/react-virtual';
import { useStore } from '@tanstack/react-store';
import { useEffect, useMemo, useRef } from 'react';
import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react';
import {
  FileAudio, FileCode, FileImage, FileJson, FileSpreadsheet, FileText,
  File as FileIcon, FileVideo,
} from 'lucide-react';
import { Input } from '../lib/universal/ui/components/ui/input';
import { markDirLoading, selectFile, setQuery, toggleDir, viewerStore } from '../app/store';
import type { ViewerState } from '../app/store';
import { kindFromName } from '../lib/fileTypes';
import { filterTree } from '../lib/treeFilter';
import type { TreeNode } from '../lib/nodes';

interface FlatRow {
  node: TreeNode;
  depth: number;
}

function flatten(nodes: TreeNode[], depth: number, expanded: Set<string>, out: FlatRow[]): void {
  for (const node of nodes) {
    out.push({ node, depth });
    if (node.kind === 'dir' && node.children && expanded.has(node.path)) {
      flatten(node.children, depth + 1, expanded, out);
    }
  }
}

function FileGlyph({ node, open }: { node: TreeNode; open?: boolean }) {
  if (node.kind === 'dir') {
    return open
      ? <FolderOpen className="size-4 shrink-0 text-(--primary)" aria-hidden />
      : <Folder className="size-4 shrink-0 text-(--muted-foreground)" aria-hidden />;
  }
  const kind = kindFromName(node.name);
  if (kind === 'image') return <FileImage className="size-4 shrink-0 text-sky-400" aria-hidden />;
  if (kind === 'pdf') return <FileText className="size-4 shrink-0 text-red-400" aria-hidden />;
  if (kind === 'video') return <FileVideo className="size-4 shrink-0 text-violet-400" aria-hidden />;
  if (kind === 'audio') return <FileAudio className="size-4 shrink-0 text-emerald-400" aria-hidden />;
  if (kind === 'csv') return <FileSpreadsheet className="size-4 shrink-0 text-amber-400" aria-hidden />;
  if (kind === 'json') return <FileJson className="size-4 shrink-0 text-yellow-400" aria-hidden />;
  if (kind === 'markdown' || kind === 'text') return <FileCode className="size-4 shrink-0 text-blue-400" aria-hidden />;
  return <FileIcon className="size-4 shrink-0 text-(--muted-foreground)" aria-hidden />;
}

async function expandLazyDir(node: TreeNode): Promise<void> {
  if (node.kind !== 'dir' || node.children || !node.loadChildren) return;
  markDirLoading(node.path, 'loading');
  try {
    node.children = await node.loadChildren();
    markDirLoading(node.path, null);
    viewerStore.setState((s) => ({ ...s, version: s.version + 1 }));
  } catch {
    markDirLoading(node.path, 'error');
  }
}

export function FileTree(): React.JSX.Element {
  const { root, expanded, selectedPath, query, dirStatus, version } = useStore(viewerStore, (s: ViewerState) => ({
    root: s.root,
    expanded: s.expanded,
    selectedPath: s.selectedPath,
    query: s.query,
    dirStatus: s.dirStatus,
    version: s.version,
  }));
  const scrollRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(() => {
    if (!root?.children) return [];
    const rows: FlatRow[] = [];
    flatten(filterTree(root.children, query), 1, expanded, rows);
    return rows;
    // version participates because lazy loads mutate node.children in place
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root, expanded, query, dirStatus, version]);

  const virtualizer = useVirtualizer({
    count: visible.length,
    estimateSize: () => 28,
    getScrollElement: () => scrollRef.current,
    overscan: 24,
  });

  // Keep lazy children for expanded dirs flowing in.
  useEffect(() => {
    if (!root?.loadChildren) return;
    void expandLazyDir(root);
  }, [root]);

  const onRowClick = (row: FlatRow): void => {
    const node = row.node;
    if (node.kind === 'dir') {
      toggleDir(node.path);
      void expandLazyDir(node);
    } else {
      selectFile(node.path);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="p-2 pb-1">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter files…"
          aria-label="Filter files by name"
          className="h-8 bg-(--background) text-sm"
        />
      </div>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto px-2 pb-2">
        {visible.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-(--muted-foreground)">
            {root ? 'No files match the filter.' : 'No folder open.'}
          </p>
        ) : (
          <ul className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((item) => {
              const { node, depth } = visible[item.index];
              const isOpen = expanded.has(node.path);
              const isSelected = node.kind === 'file' && node.path === selectedPath;
              const status = dirStatus[node.path];
              return (
                <li
                  key={node.path}
                  ref={virtualizer.measureElement}
                  data-index={item.index}
                  className="absolute left-0 top-0 w-full"
                  style={{ transform: `translateY(${item.start}px)` }}
                >
                  <button
                    type="button"
                    onClick={() => onRowClick({ node, depth })}
                    aria-current={isSelected ? 'true' : undefined}
                    aria-expanded={node.kind === 'dir' ? isOpen : undefined}
                    className={`flex w-full items-center gap-1 rounded-md px-1.5 py-1 text-left text-sm ${
                      isSelected
                        ? 'bg-(--accent) text-(--accent-foreground)'
                        : 'hover:bg-(--accent)/60'
                    }`}
                    style={{ paddingLeft: `${(depth - 1) * 14 + 6}px` }}
                    title={node.path}
                  >
                    {node.kind === 'dir' ? (
                      isOpen ? <ChevronDown className="size-3.5 shrink-0 text-(--muted-foreground)" aria-hidden /> : <ChevronRight className="size-3.5 shrink-0 text-(--muted-foreground)" aria-hidden />
                    ) : (
                      <span className="inline-block size-3.5 shrink-0" aria-hidden />
                    )}
                    <FileGlyph node={node} open={isOpen} />
                    <span className="truncate">{node.name}</span>
                    {status === 'loading' && <span className="ml-auto text-[10px] text-(--muted-foreground)">loading…</span>}
                    {status === 'error' && <span className="ml-auto text-[10px] text-red-400">error</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
