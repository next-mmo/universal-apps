import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { MAX_TEXT_BYTES, resolveKind } from '../lib/fileTypes';
import type { FileKind } from '../lib/fileTypes';
import type { TreeNode } from '../lib/nodes';

export interface FileContent {
  kind: FileKind;
  size: number;
  /** Full bytes (small files) or null when only text was read for a huge text file. */
  bytes: Uint8Array | null;
  /** Decoded text for text-ish kinds; empty for binary. */
  text: string | null;
  truncated: boolean;
}

const MIME_BY_EXT: Record<string, string> = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
  webp: 'image/webp', bmp: 'image/bmp', ico: 'image/x-icon', avif: 'image/avif',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
  mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', m4v: 'video/x-m4v', ogv: 'video/ogg',
  mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', flac: 'audio/flac',
  m4a: 'audio/mp4', aac: 'audio/aac', opus: 'audio/opus',
};

function mimeFor(name: string): string {
  return MIME_BY_EXT[name.toLowerCase().split('.').pop() ?? ''] ?? 'application/octet-stream';
}

async function loadContent(node: TreeNode): Promise<FileContent> {
  if (!node.getFile) throw new Error(`No file backing for ${node.path}`);
  const file = await node.getFile();
  const named = resolveKind(file.name, null);
  const wantsText =
    named === 'text' || named === 'markdown' || named === 'json' || named === 'csv' || named === null;

  if (wantsText) {
    const truncated = file.size > MAX_TEXT_BYTES;
    const slice = truncated ? file.slice(0, MAX_TEXT_BYTES) : file;
    const bytes = new Uint8Array(await slice.arrayBuffer());
    const kind = resolveKind(file.name, bytes);
    if (kind === 'hex') return { kind, size: file.size, bytes, text: null, truncated: false };
    return {
      kind, size: file.size, bytes: null,
      text: new TextDecoder('utf-8', { fatal: false }).decode(bytes),
      truncated,
    };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  return { kind: resolveKind(file.name, bytes), size: file.size, bytes, text: null, truncated: false };
}

export interface UseFileContentResult {
  content: FileContent | null;
  /** Blob URL for image/pdf/video/audio kinds; null otherwise. Revoked on change/unmount. */
  url: string | null;
  loading: boolean;
  error: Error | null;
}

/** Read a file once per path via TanStack Query; all viewers share this cache. */
export function useFileContent(node: TreeNode | null): UseFileContentResult {
  const query = useQuery({
    queryKey: ['file', node?.path],
    queryFn: () => loadContent(node as TreeNode),
    enabled: node?.kind === 'file' && Boolean(node.getFile),
    staleTime: Infinity,
    retry: false,
  });

  const content = query.data ?? null;
  const mediaContent = content && content.bytes && (content.kind === 'image' || content.kind === 'pdf' || content.kind === 'video' || content.kind === 'audio')
    ? content
    : null;

  const url = useMemo(() => {
    if (!mediaContent?.bytes) return null;
    return URL.createObjectURL(new Blob([mediaContent.bytes.slice() as unknown as BlobPart], { type: mimeFor(node?.name ?? '') }));
  }, [mediaContent, node?.name]);

  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  return { content, url, loading: query.isPending, error: query.error as Error | null };
}
