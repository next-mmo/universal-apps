import { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../lib/universal/ui/components/ui/tabs';
import { CodeView } from './CodeView';
import { languageFor } from '../../lib/fileTypes';

export interface JsonViewProps {
  text: string;
  name: string;
  theme: 'dark' | 'light';
}

export function JsonView({ text, name, theme }: JsonViewProps): React.JSX.Element {
  const parsed = useMemo(() => {
    try {
      return { value: JSON.stringify(JSON.parse(text), null, 2) as string, ok: true };
    } catch {
      return { value: text, ok: false };
    }
  }, [text]);

  return (
    <Tabs defaultValue="pretty" className="flex h-full flex-col gap-2">
      <div className="flex justify-end px-3 pt-2">
        <TabsList>
          <TabsTrigger value="pretty">Pretty</TabsTrigger>
          <TabsTrigger value="raw">Raw</TabsTrigger>
        </TabsList>
      </div>
      {!parsed.ok && (
        <p className="px-3 text-xs text-amber-400">Invalid JSON — showing the raw bytes as text.</p>
      )}
      <TabsContent value="pretty" className="min-h-0 flex-1">
        <CodeView value={parsed.value} language="json" theme={theme} />
      </TabsContent>
      <TabsContent value="raw" className="min-h-0 flex-1">
        <CodeView value={text} language={languageFor(name)} theme={theme} />
      </TabsContent>
    </Tabs>
  );
}
