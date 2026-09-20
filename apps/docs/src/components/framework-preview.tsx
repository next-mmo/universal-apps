import { useEffect, useRef, useState } from 'react';

import { Button } from '@package/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@package/ui/card';
import { Input } from '@package/ui/input';

type Framework = 'react' | 'vue' | 'svelte' | 'uniwind';

const frameworks: Array<{ id: Framework; label: string; source: string }> = [
  {
    id: 'react',
    label: 'React DOM',
    source: `<Card>
  <CardHeader>
    <CardTitle>New task</CardTitle>
    <CardDescription>Create a task with the shared DOM components.</CardDescription>
  </CardHeader>
  <CardContent>
    <Input value={title} onChange={(event) => setTitle(event.target.value)} />
    <Button onClick={() => setSaved(true)}>Add task</Button>
  </CardContent>
</Card>`,
  },
  {
    id: 'vue',
    label: 'Vue',
    source: `<script setup lang="ts">
import { ref } from 'vue'
const title = ref('')
const saved = ref(false)
</script>

<template>
  <section class="task-card">
    <h2>New task</h2>
    <p>Create a task with Vue and shared design tokens.</p>
    <input v-model="title" aria-label="Task title" />
    <button @click="saved = true">{{ saved ? 'Added' : 'Add task' }}</button>
  </section>
</template>`,
  },
  {
    id: 'svelte',
    label: 'Svelte',
    source: `<script lang="ts">
  let title = ''
  let saved = false
</script>

<section class="task-card">
  <h2>New task</h2>
  <p>Create a task with Svelte and shared design tokens.</p>
  <input bind:value={title} aria-label="Task title" />
  <button onclick={() => (saved = true)}>{saved ? 'Added' : 'Add task'}</button>
</section>`,
  },
  {
    id: 'uniwind',
    label: 'React Native + UniWind',
    source: `import { Button, Card, CardContent, CardTitle, Input } from '@package/ui-native'
import { Text, View } from 'react-native'

<Card>
  <View className="gap-3 p-4">
    <CardTitle>New task</CardTitle>
    <Text>Create a task with React Native Web and UniWind.</Text>
    <Input value={title} onChangeText={setTitle} />
    <Button onPress={() => setSaved(true)}>Add task</Button>
  </View>
</Card>`,
  },
];

const storageKey = 'docs-preview-framework';

export function FrameworkPreview() {
  const [framework, setFramework] = useState<Framework>('react');
  const [title, setTitle] = useState('Ship the browser docs');
  const [saved, setSaved] = useState(false);
  const [frameState, setFrameState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const selected = frameworks.find((item) => item.id === framework) ?? frameworks[0];

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
    const timeout = window.setTimeout(() => setFrameState('failed'), 10_000);
    const onMessage = (event: MessageEvent<unknown>) => {
      if (event.source !== frameRef.current?.contentWindow || event.origin !== 'null') return;
      const payload = event.data as { type?: string; framework?: string } | null;
      if (payload?.type === 'docs-preview-ready' && payload.framework === framework) {
        window.clearTimeout(timeout);
        setFrameState('ready');
      }
    };

    window.addEventListener('message', onMessage);
    setPreviewSrc(`/previews/${framework}/`);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('message', onMessage);
    };
  }, [framework]);

  const chooseFramework = (next: Framework) => {
    setFramework(next);
    setSaved(false);
    setFrameState('loading');
    setPreviewSrc(null);
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      // The current selection still works for this visit.
    }
  };

  return (
    <section className='my-8 overflow-hidden rounded-xl border border-fd-border bg-fd-card'>
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-fd-border px-4 py-3'>
        <div>
          <h2 className='text-sm font-semibold text-fd-foreground'>Live framework preview</h2>
          <p className='text-xs text-fd-muted-foreground'>Switch implementations without leaving this page.</p>
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
            <Card className='mx-auto max-w-lg'>
              <CardHeader>
                <CardTitle>New task</CardTitle>
                <CardDescription>Create a task with the shared React DOM components.</CardDescription>
              </CardHeader>
              <CardContent className='flex flex-col gap-3'>
                <Input
                  aria-label='Task title'
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder='Task title'
                />
                <div className='flex items-center justify-between gap-3'>
                  <span role='status' className='text-sm text-muted-foreground'>
                    {saved ? `Added: ${title || 'Untitled task'}` : 'Ready to add'}
                  </span>
                  <Button onClick={() => setSaved(true)}>Add task</Button>
                </div>
              </CardContent>
            </Card>
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
                key={framework}
                ref={frameRef}
                title={`${selected.label} live example`}
                src={previewSrc ?? undefined}
                sandbox='allow-scripts'
                referrerPolicy='no-referrer'
                className='h-64 w-full rounded-lg bg-background'
              />
            </>
          )}
        </div>
        <div className='min-w-0 p-4'>
          <div className='mb-2 text-xs font-medium text-fd-muted-foreground'>
            {selected.label} implementation
          </div>
          <pre className='max-h-64 overflow-auto rounded-lg bg-fd-secondary p-3 text-xs leading-relaxed text-fd-secondary-foreground'>
            <code>{selected.source}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
