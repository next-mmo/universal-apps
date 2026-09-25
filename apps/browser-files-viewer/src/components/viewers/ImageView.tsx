import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../lib/universal/ui/components/ui/tabs';
import { CodeView } from './CodeView';
import { isSvg, languageFor } from '../../lib/fileTypes';

export interface ImageViewProps {
  url: string;
  name: string;
  bytes: Uint8Array | null;
  theme: 'dark' | 'light';
}

export function ImageView({ url, name, bytes, theme }: ImageViewProps): React.JSX.Element {
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const showSourceTabs = isSvg(name);
  const source = useMemo(
    () => (showSourceTabs && bytes ? new TextDecoder().decode(bytes) : null),
    [showSourceTabs, bytes],
  );

  return showSourceTabs ? (
    <Tabs defaultValue="image" className="flex h-full flex-col gap-2">
      <div className="flex justify-end px-3 pt-2">
        <TabsList>
          <TabsTrigger value="image">Image</TabsTrigger>
          <TabsTrigger value="source">Source</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="image" className="min-h-0 flex-1">
        <img src={url} alt={name} onLoad={(e) => setDims({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })} className="mx-auto max-h-full max-w-full object-contain p-4" />
      </TabsContent>
      <TabsContent value="source" className="min-h-0 flex-1">
        <CodeView value={source ?? ''} language={languageFor(name)} theme={theme} />
      </TabsContent>
    </Tabs>
  ) : (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-4">
      <img
        src={url}
        alt={name}
        onLoad={(e) => setDims({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
        className="max-h-full max-w-full object-contain"
      />
      {dims && <span className="text-xs text-(--muted-foreground)">{dims.w} × {dims.h} px</span>}
    </div>
  );
}
