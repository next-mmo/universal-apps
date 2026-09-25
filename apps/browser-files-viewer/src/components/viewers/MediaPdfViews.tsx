export function PdfView({ url, name }: { url: string; name: string }): React.JSX.Element {
  return (
    <iframe
      src={url}
      title={`PDF preview of ${name}`}
      className="h-full w-full border-0 bg-white"
    />
  );
}

export function MediaView({ url, name, kind }: { url: string; name: string; kind: 'video' | 'audio' }): React.JSX.Element {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
      {kind === 'video' ? (
        <video src={url} controls className="max-h-full max-w-full rounded-lg" aria-label={`Video player for ${name}`}>
          <track kind="captions" />
        </video>
      ) : (
        <audio src={url} controls className="w-full max-w-lg" aria-label={`Audio player for ${name}`}>
          <track kind="captions" />
        </audio>
      )}
      <p className="text-xs text-(--muted-foreground)">
        Playback uses your browser's native codecs. Unsupported formats (e.g. some .mov/.mkv codecs) will not play.
      </p>
    </div>
  );
}
