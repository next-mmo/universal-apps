import { useStore } from '@tanstack/react-store';
import { Badge } from '../lib/universal/ui/components/ui/badge';
import { Skeleton } from '../lib/universal/ui/components/ui/skeleton';
import { useFileContent } from '../hooks/useFileContent';
import type { FileContent } from '../hooks/useFileContent';
import { viewerStore } from '../app/store';
import type { ViewerState } from '../app/store';
import { languageFor } from '../lib/fileTypes';
import type { TreeNode } from '../lib/nodes';
import { CodeView } from './viewers/CodeView';
import { CsvView } from './viewers/CsvView';
import { HexView } from './viewers/HexView';
import { ImageView } from './viewers/ImageView';
import { JsonView } from './viewers/JsonView';
import { MarkdownView } from './viewers/MarkdownView';
import { MediaView, PdfView } from './viewers/MediaPdfViews';

const KIND_LABEL: Record<string, string> = {
  markdown: 'Markdown', json: 'JSON', csv: 'CSV', image: 'Image', pdf: 'PDF',
  video: 'Video', audio: 'Audio', text: 'Text', hex: 'Binary',
};

function viewerFor(content: FileContent, name: string, theme: 'dark' | 'light', url: string | null): React.JSX.Element {
  switch (content.kind) {
    case 'markdown':
      return <MarkdownView text={content.text ?? ''} theme={theme} />;
    case 'json':
      return <JsonView text={content.text ?? ''} name={name} theme={theme} />;
    case 'csv':
      return <CsvView text={content.text ?? ''} name={name} />;
    case 'text':
      return (
        <div className="flex h-full flex-col">
          {content.truncated && (
            <p className="bg-amber-500/10 px-3 py-1.5 text-xs text-amber-400">
              Large file — showing the first 4 MB. (Viewer only; nothing is edited or saved.)
            </p>
          )}
          <div className="min-h-0 flex-1">
            <CodeView value={content.text ?? ''} language={languageFor(name)} theme={theme} />
          </div>
        </div>
      );
    case 'image':
      return url
        ? <ImageView url={url} name={name} bytes={content.bytes} theme={theme} />
        : <Placeholder label="Preparing preview…" />;
    case 'pdf':
      return url ? <PdfView url={url} name={name} /> : <Placeholder label="Preparing preview…" />;
    case 'video':
    case 'audio':
      return url ? <MediaView url={url} name={name} kind={content.kind} /> : <Placeholder label="Preparing preview…" />;
    case 'hex':
      return content.bytes
        ? <HexView bytes={content.bytes} />
        : <Placeholder label="No bytes available." />;
    default:
      return <Placeholder label="Unsupported file." />;
  }
}

function Placeholder({ label }: { label: string }): React.JSX.Element {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <p className="text-sm text-(--muted-foreground)">{label}</p>
    </div>
  );
}

export function Viewer({ node }: { node: TreeNode | null }): React.JSX.Element {
  const theme = useStore(viewerStore, (s: ViewerState) => s.theme);
  const { content, url, loading, error } = useFileContent(node);

  if (!node) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-sm text-(--muted-foreground)">Select a file in the tree to view it.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 border-b border-(--border) px-3 py-1.5">
        <Badge variant="secondary" className="font-mono text-[10px] uppercase">
          {content ? KIND_LABEL[content.kind] ?? 'File' : '…'}
        </Badge>
        <span className="truncate text-xs text-(--muted-foreground)" title={node.path}>{node.path}</span>
      </div>
      <div className="min-h-0 flex-1">
        {error ? (
          <Placeholder label={`Could not read this file: ${error.message}`} />
        ) : loading ? (
          <div className="flex h-full flex-col gap-2 p-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : content ? (
          viewerFor(content, node.name, theme, url)
        ) : null}
      </div>
    </div>
  );
}
