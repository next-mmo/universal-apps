<script lang="ts">
import type { Snippet } from 'svelte';

interface Props {
  title: string;
  description?: string;
  breadcrumbs?: Array<string>;
  extra?: Snippet;
  footer?: Snippet;
  children: Snippet;
}

let {
  title,
  description = undefined,
  breadcrumbs = [],
  extra,
  footer,
  children,
}: Props = $props();
</script>

<div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
  <div class="flex flex-wrap items-end justify-between gap-3">
    <div class="flex flex-col gap-1">
      {#if breadcrumbs.length > 0}
        <nav aria-label="Breadcrumb" class="text-xs text-muted-foreground">
          {breadcrumbs.join(' / ')}
        </nav>
      {/if}
      <h1 class="text-2xl font-bold tracking-[-0.02em]">{title}</h1>
      {#if description !== undefined}
        <p class="text-sm text-muted-foreground">{description}</p>
      {/if}
    </div>
    {#if extra}<div class="flex items-center gap-2">{@render extra()}</div>{/if}
  </div>

  <div class="flex flex-col gap-6">
    {@render children()}
  </div>

  {#if footer}
    <footer class="border-t pt-4 text-xs text-muted-foreground">{@render footer()}</footer>
  {/if}
</div>
