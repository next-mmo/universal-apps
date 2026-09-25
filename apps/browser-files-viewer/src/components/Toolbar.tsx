import { useStore } from '@tanstack/react-store';
import { useRef } from 'react';
import { Moon, FolderOpen, Sun, Upload } from 'lucide-react';
import { Button } from '../lib/universal/ui/components/ui/button';
import { Separator } from '../lib/universal/ui/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '../lib/universal/ui/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../lib/universal/ui/components/ui/tooltip';
import { toast } from '../lib/universal/ui/components/ui/toast';
import { setRoot, setTheme, viewerStore } from '../app/store';
import type { ViewerState } from '../app/store';
import { pickDirectory, supportsFsAccess, treeFromFileList } from '../lib/fsAccess';
import { demoTree } from '../lib/demo';

export function Toolbar(): React.JSX.Element {
  const theme = useStore(viewerStore, (s: ViewerState) => s.theme);
  const inputRef = useRef<HTMLInputElement>(null);

  const openFolder = async (): Promise<void> => {
    try {
      const root = await pickDirectory();
      if (root) setRoot(root, root.name);
    } catch (err) {
      toast(`Could not open folder: ${err instanceof Error ? err.message : String(err)}`, { variant: 'error' });
    }
  };

  const onCompatPicked = (files: FileList | null): void => {
    if (!files || files.length === 0) return;
    const first = files[0] as File & { webkitRelativePath?: string };
    const rootName = first.webkitRelativePath?.split('/')[0] || 'uploaded-files';
    const root = treeFromFileList(rootName, Array.from(files));
    setRoot(root, rootName);
  };

  return (
    <header className="flex h-12 items-center gap-2 border-b border-(--border) bg-(--card) px-3">
      <span className="mr-1 font-mono text-sm font-semibold tracking-tight">browser-files-viewer</span>
      <Separator orientation="vertical" className="h-5" />
      <TooltipProvider delayDuration={200}>
        {supportsFsAccess() && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => void openFolder()}>
                <FolderOpen aria-hidden /> Open folder
              </Button>
            </TooltipTrigger>
            <TooltipContent>Choose a folder on disk (read-only)</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()}>
              <Upload aria-hidden /> Open folder (compat)
            </Button>
          </TooltipTrigger>
          <TooltipContent>Works in every browser; reads files into memory</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => setRoot(demoTree(), 'demo-files')}>
              Load demo files
            </Button>
          </TooltipTrigger>
          <TooltipContent>In-memory sample tree — try every viewer</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={(e) => onCompatPicked(e.target.files)}
        aria-hidden
        tabIndex={-1}
      />

      <div className="ml-auto">
        <ToggleGroup
          type="single"
          value={theme}
          onValueChange={(v) => { if (v === 'dark' || v === 'light') setTheme(v); }}
          aria-label="Color theme"
        >
          <ToggleGroupItem value="light" aria-label="Light theme"><Sun className="size-4" aria-hidden /></ToggleGroupItem>
          <ToggleGroupItem value="dark" aria-label="Dark theme"><Moon className="size-4" aria-hidden /></ToggleGroupItem>
        </ToggleGroup>
      </div>
    </header>
  );
}
