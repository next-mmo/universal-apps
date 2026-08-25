<script lang="ts">
import { fade, scale } from 'svelte/transition';

import ProForm from './pro-form.svelte';

import type { ProFormGroup, ProFormValues } from '@package/pro-core/src/form/schema';

interface Props {
  open: boolean;
  title: string;
  description?: string;
  schema: Array<ProFormGroup>;
  defaultValues: ProFormValues;
  submitLabel?: string;
  pending?: boolean;
  onSubmit: (values: ProFormValues) => Promise<void> | void;
  onclose: () => void;
}

let {
  open,
  title,
  description = undefined,
  schema,
  defaultValues,
  submitLabel = undefined,
  pending = false,
  onSubmit,
  onclose,
}: Props = $props();
</script>

<svelte:window
  onkeydown={(event) => {
    if (open && event.key === 'Escape') onclose();
  }}
/>

{#if open}
  <!-- Intro-only transitions: instant teardown on close guarantees each
       open mounts a fresh form (no interrupted-transition state reuse). -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4 backdrop-blur-sm"
    in:fade={{ duration: 120 }}
    onclick={(event) => {
      if (event.target === event.currentTarget) onclose();
    }}
    onkeydown={() => {}}
    role="presentation"
  >
    <div
      class="w-full max-w-lg rounded-2xl border border-border bg-popover p-6 shadow-[var(--shadow-overlay)]"
      in:scale={{ duration: 150, start: 0.96 }}
      role="dialog"
      aria-modal="true"
    >
      <div class="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold tracking-[-0.02em]">{title}</h2>
          {#if description !== undefined}
            <p class="mt-1 text-sm text-muted-foreground">{description}</p>
          {/if}
        </div>
        <button
          type="button"
          aria-label="Close"
          class="rounded-lg px-2 py-1 text-muted-foreground hover:bg-accent"
          onclick={onclose}
        >
          ✕
        </button>
      </div>

      <ProForm
        {schema}
        {defaultValues}
        {submitLabel}
        {pending}
        onCancel={onclose}
        onSubmit={async (values) => {
          await onSubmit(values);
          onclose();
        }}
      />
    </div>
  </div>
{/if}
