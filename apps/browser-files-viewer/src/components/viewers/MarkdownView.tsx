import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../lib/universal/ui/components/ui/tabs';
import { CodeView } from './CodeView';
import { renderMarkdown } from '../../lib/markdown';

export function MarkdownView({ text, theme }: { text: string; theme: 'dark' | 'light' }): React.JSX.Element {
  const [mode, setMode] = useState<'preview' | 'source'>('preview');
  const html = useMemo(() => renderMarkdown(text), [text]);

  return (
    <Tabs value={mode} onValueChange={(v) => setMode(v as 'preview' | 'source')} className="flex h-full flex-col gap-2">
      <div className="flex justify-end px-3 pt-2">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="source">Source</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="preview" className="min-h-0 flex-1 overflow-auto px-6 pb-6">
        <article
          className="prose-bfv mx-auto max-w-3xl"
          // Content is sanitized through DOMPurify in renderMarkdown.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </TabsContent>
      <TabsContent value="source" className="min-h-0 flex-1">
        <CodeView value={text} language="markdown" theme={theme} minimal />
      </TabsContent>
    </Tabs>
  );
}
