import { useEffect, useRef, useState, type ComponentType } from 'react';

import { AccordionDemo } from '../demos/accordion';
import { BadgeDemo } from '../demos/badge';
import { ButtonDemo } from '../demos/button';
import { CardDemo } from '../demos/card';
import { CheckboxDemo } from '../demos/checkbox';
import { DialogDemo } from '../demos/dialog';
import { DropdownMenuDemo } from '../demos/dropdown-menu';
import { InputDemo } from '../demos/input';
import { LabelDemo } from '../demos/label';
import { PopoverDemo } from '../demos/popover';
import { SelectDemo } from '../demos/select';
import { SeparatorDemo } from '../demos/separator';
import { SkeletonDemo } from '../demos/skeleton';
import { SwitchDemo } from '../demos/switch';
import { TableDemo } from '../demos/table';
import { TabsDemo } from '../demos/tabs';
import { TextareaDemo } from '../demos/textarea';
import { TooltipDemo } from '../demos/tooltip';

type Framework = 'react' | 'vue' | 'svelte' | 'uniwind';

/**
 * Per-component demos. Each entry renders for the React DOM tab, and every
 * framework has a matching demo file under `previews/<fw>/src/demos/`. The
 * source panel shows those files verbatim through Vite's `?raw` glob, so the
 * code a reader copies is always the code that runs, and the two cannot
 * drift apart.
 */
const demoComponents: Record<string, ComponentType> = {
  accordion: AccordionDemo,
  badge: BadgeDemo,
  button: ButtonDemo,
  card: CardDemo,
  checkbox: CheckboxDemo,
  dialog: DialogDemo,
  'dropdown-menu': DropdownMenuDemo,
  input: InputDemo,
  label: LabelDemo,
  popover: PopoverDemo,
  select: SelectDemo,
  separator: SeparatorDemo,
  skeleton: SkeletonDemo,
  switch: SwitchDemo,
  table: TableDemo,
  tabs: TabsDemo,
  textarea: TextareaDemo,
  tooltip: TooltipDemo,
};

const reactSources = import.meta.glob<string>('../demos/*.tsx', { query: '?raw', import: 'default', eager: true });
const vueSources = import.meta.glob<string>('../../previews/vue/src/demos/*.vue', { query: '?raw', import: 'default', eager: true });
const svelteSources = import.meta.glob<string>('../../previews/svelte/src/demos/*.svelte', { query: '?raw', import: 'default', eager: true });
const uniwindSources = import.meta.glob<string>('../../previews/uniwind/src/demos/*.tsx', { query: '?raw', import: 'default', eager: true });

/** Index raw glob results by demo id (the file name without extension). */
function indexSources(glob: Record<string, string>): Record<string, string> {
  const byId: Record<string, string> = {};
  for (const [path, source] of Object.entries(glob)) {
    byId[path.split('/').pop()!.replace(/\.[a-z]+$/, '')] = source;
  }
  return byId;
}

const sourcesByFramework: Record<Framework, Record<string, string>> = {
  react: indexSources(reactSources),
  vue: indexSources(vueSources),
  svelte: indexSources(svelteSources),
  uniwind: indexSources(uniwindSources),
};

const frameworks: Array<{ id: Framework; label: string; fileFor: (id: string) => string }> = [
  { id: 'react', label: 'React DOM', fileFor: (id) => `apps/docs/src/demos/${id}.tsx` },
  { id: 'vue', label: 'Vue', fileFor: (id) => `apps/docs/previews/vue/src/demos/${id}.vue` },
  { id: 'svelte', label: 'Svelte', fileFor: (id) => `apps/docs/previews/svelte/src/demos/${id}.svelte` },
  { id: 'uniwind', label: 'React Native + UniWind', fileFor: (id) => `apps/docs/previews/uniwind/src/demos/${id}.tsx` },
];

const storageKey = 'docs-preview-framework';

/** Component id backing a docs page path, or null when the page has no preview demo. */
export function resolvePreviewComponent(pagePath: string): string | null {
  const match = /^components\/([a-z0-9-]+?)(?:\.mdx?)?$/.exec(pagePath);
  if (!match) return null;
  return demoComponents[match[1]] ? match[1] : null;
}

function componentLabel(id: string): string {
  return id
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function FrameworkPreview({ componentId }: { componentId: string }) {
  const Demo = demoComponents[componentId];
  const [framework, setFramework] = useState<Framework>('react');
  const [frameState, setFrameState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const selected = frameworks.find((item) => item.id === framework) ?? frameworks[0];
  const source = sourcesByFramework[framework][componentId];
  const sourceFile = selected.fileFor(componentId);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (frameworks.some((item) => item.id === stored)) {
        const restored = stored as Framework;
        setFramework(restored);
      }
    } catch {
      // Keep React DOM selected when browser storage is unavailable.
    }
  }, []);

  useEffect(() => {
    if (framework === 'react') return;

    setFrameState('loading');
    const timeout = window.setTimeout(() => setFrameState('failed'), 20_000);
    const onMessage = (event: MessageEvent<unknown>) => {
      if (event.source !== frameRef.current?.contentWindow || event.origin !== window.location.origin) return;
      const payload = event.data as { type?: string; framework?: string } | null;
      if (payload?.type === 'docs-preview-ready' && payload.framework === framework) {
        window.clearTimeout(timeout);
        setFrameState('ready');
      }
    };

    window.addEventListener('message', onMessage);
    setPreviewSrc(`/previews/${framework}/?component=${encodeURIComponent(componentId)}`);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('message', onMessage);
    };
  }, [framework, componentId]);

  const chooseFramework = (next: Framework) => {
    setFramework(next);
    setFrameState('loading');
    setPreviewSrc(null);
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      // The current selection still works for this visit.
    }
  };

  if (!Demo || !source) return null;

  return (
    <section className='my-8 overflow-hidden rounded-xl border border-fd-border bg-fd-card'>
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-fd-border px-4 py-3'>
        <div>
          <h2 className='text-sm font-semibold text-fd-foreground'>Live framework preview</h2>
          <p className='text-xs text-fd-muted-foreground'>The {componentLabel(componentId)} example, implemented for each framework.</p>
        </div>
        <label className='flex items-center gap-2 text-xs font-medium text-fd-muted-foreground'>
          Preview
          <select
            aria-label='Live preview framework'
            className='rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 text-sm text-fd-foreground'
            value={framework}
            onChange={(event) => chooseFramework(event.target.value as Framework)}
          >
            {frameworks.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className='grid min-w-0 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)]'>
        <div className='relative min-h-64 border-b border-fd-border p-4 lg:border-b-0 lg:border-r'>
          {framework === 'react' ? (
            <Demo />
          ) : (
            <>
              {frameState === 'loading' ? (
                <div role='status' className='absolute inset-0 z-10 grid place-items-center bg-fd-background/80 text-sm text-fd-muted-foreground'>
                  Loading {selected.label} preview…
                </div>
              ) : null}
              {frameState === 'failed' ? (
                <div role='alert' className='absolute inset-0 z-10 grid place-items-center bg-fd-background p-6 text-center'>
                  <div>
                    <p className='font-medium text-fd-foreground'>This preview did not load.</p>
                    <p className='mt-1 text-sm text-fd-muted-foreground'>The docs remain available. Choose React DOM to continue.</p>
                    <button className='mt-3 text-sm font-medium text-fd-primary underline' onClick={() => chooseFramework('react')}>
                      Return to React DOM
                    </button>
                  </div>
                </div>
              ) : null}
              <iframe
                key={`${framework}-${componentId}`}
                ref={frameRef}
                title={`${selected.label} ${componentLabel(componentId)} example`}
                src={previewSrc ?? undefined}
                // allow-same-origin is required: without it the frame's opaque origin turns the
                // built `type=module crossorigin` fetch into a CORS request the dev server rejects.
                sandbox='allow-scripts allow-same-origin'
                referrerPolicy='no-referrer'
                className='h-64 w-full rounded-lg bg-background'
              />
            </>
          )}
        </div>
        <div className='min-w-0 p-4'>
          <div className='mb-1 text-xs font-medium text-fd-muted-foreground'>
            {selected.label} implementation
          </div>
          <div className='mb-2 truncate font-mono text-[11px] text-fd-muted-foreground/80' title={sourceFile}>
            {sourceFile}
          </div>
          <pre className='max-h-64 overflow-auto rounded-lg bg-fd-secondary p-3 text-xs leading-relaxed text-fd-secondary-foreground'>
            <code>{source}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
