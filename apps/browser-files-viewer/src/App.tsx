import { useStore } from '@tanstack/react-store';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { FolderOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './lib/universal/ui/components/ui/card';
import { toast, Toaster } from './lib/universal/ui/components/ui/toast';
import { FileTree } from './components/FileTree';
import { Toolbar } from './components/Toolbar';
import { Viewer } from './components/Viewer';
import { selectFile, setRoot, viewerStore } from './app/store';
import type { ViewerState } from './app/store';
import { treeFromDataTransfer } from './lib/fsAccess';
import type { TreeNode } from './lib/nodes';

function findNode(node: TreeNode | null, path: string): TreeNode | null {
  if (!node) return null;
  if (node.path === path) return node;
  if (node.kind !== 'dir' || !node.children) return null;
  // Only descend into directories that prefix the target path.
  for (const child of node.children) {
    if (path === child.path || path.startsWith(`${child.path}/`)) {
      const hit = findNode(child, path);
      if (hit) return hit;
    }
  }
  return null;
}

function StatusBar(): React.JSX.Element {
  const { rootLabel, selectedPath } = useStore(viewerStore, (s: ViewerState) => ({ rootLabel: s.rootLabel, selectedPath: s.selectedPath }));
  return (
    <footer className="flex h-7 items-center gap-3 border-t border-(--border) bg-(--card) px-3 text-xs text-(--muted-foreground)">
      <span className="truncate">{rootLabel || 'No folder open'}</span>
      {selectedPath && <span className="truncate">— {selectedPath}</span>}
    </footer>
  );
}

function EmptyState(): React.JSX.Element {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <Card className="w-full max-w-md border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FolderOpen className="size-5 text-(--muted-foreground)" aria-hidden /> View a folder
          </CardTitle>
          <CardDescription>
            Open a folder from disk (Chrome/Edge), use the compat picker, or drag files here.
            Read-only: files are rendered locally and never leave your browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xs text-(--muted-foreground)">
          Supported views: code &amp; text (Monaco read-only), Markdown, JSON, CSV, images,
          PDF, audio/video, and a hex dump for everything else.
        </CardContent>
      </Card>
    </div>
  );
}

function EmptySelectionHint(): React.JSX.Element {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <p className="text-sm text-(--muted-foreground)">Select a file in the tree to view it.</p>
    </div>
  );
}

export default function App(): React.JSX.Element {
  const { root, selectedPath } = useStore(viewerStore, (s: ViewerState) => ({ root: s.root, selectedPath: s.selectedPath }));
  const [dragging, setDragging] = useState(false);
  const search = useSearch({ strict: false }) as { file?: string };
  const navigate = useNavigate();

  // Deep link: ?file=<path> selects a file present in the loaded tree.
  useEffect(() => {
    if (search.file && search.file !== viewerStore.state.selectedPath) selectFile(search.file);
  }, [search.file]);

  // Selection from the tree updates the URL so views are shareable.
  useEffect(() => {
    if (selectedPath && selectedPath !== search.file) {
      void navigate({ to: '.', search: (prev: { file?: string }) => ({ ...prev, file: selectedPath }) });
    }
  }, [selectedPath, search.file, navigate]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void treeFromDataTransfer(e.dataTransfer.items, Array.from(e.dataTransfer.files))
      .then((root) => setRoot(root, root.name))
      .catch((err) => toast(`Could not read dropped items: ${err instanceof Error ? err.message : String(err)}`, { variant: 'error' }));
  }, []);

  const selectedNode = root ? findNode(root, selectedPath ?? '') : null;

  return (
    <div
      className="flex h-screen flex-col bg-(--background) text-(--foreground)"
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) setDragging(false); }}
      onDrop={onDrop}
    >
      <Toolbar />
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-72 shrink-0 flex-col border-r border-(--border) bg-(--card)">
          <FileTree />
        </aside>
        <main className="min-w-0 flex-1">
          {selectedNode
            ? <Viewer node={selectedNode} />
            : root
              ? <EmptySelectionHint />
              : <EmptyState />}
        </main>
      </div>
      <StatusBar />
      {dragging && (
        <div
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-(--background)/70"
          aria-hidden
        >
          <p className="rounded-xl border-2 border-dashed border-(--primary) px-8 py-6 text-sm font-medium">
            Drop files or a folder to view
          </p>
        </div>
      )}
      <Toaster />
    </div>
  );
}
