<script lang="ts">
  import type { Component } from 'svelte';

  import AccordionDemo from './demos/accordion.svelte';
  import BadgeDemo from './demos/badge.svelte';
  import ButtonDemo from './demos/button.svelte';
  import CardDemo from './demos/card.svelte';
  import CheckboxDemo from './demos/checkbox.svelte';
  import DialogDemo from './demos/dialog.svelte';
  import DropdownMenuDemo from './demos/dropdown-menu.svelte';
  import InputDemo from './demos/input.svelte';
  import LabelDemo from './demos/label.svelte';
  import PopoverDemo from './demos/popover.svelte';
  import SelectDemo from './demos/select.svelte';
  import SeparatorDemo from './demos/separator.svelte';
  import SkeletonDemo from './demos/skeleton.svelte';
  import SwitchDemo from './demos/switch.svelte';
  import TableDemo from './demos/table.svelte';
  import TabsDemo from './demos/tabs.svelte';
  import TextareaDemo from './demos/textarea.svelte';
  import TooltipDemo from './demos/tooltip.svelte';

  /**
   * Per-component demos selected by the docs panel via `?component=<id>`.
   * Without that parameter (a direct visit to /previews/svelte/) the original
   * task-card example renders as the standalone demo.
   */
  const demos: Record<string, Component> = {
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

  const componentId = new URLSearchParams(window.location.search).get('component') ?? '';
  const Demo = $derived(demos[componentId]);

  let title = $state('Ship the browser docs');
  let saved = $state(false);
</script>

<main class="min-h-screen bg-background p-4 text-foreground">
  {#if Demo}
    <Demo />
  {:else}
    <section class="mx-auto max-w-lg rounded-xl border border-border bg-card p-5 shadow-sm">
      <h1 class="text-lg font-semibold">New task</h1>
      <p class="mt-1 text-sm text-muted-foreground">Create a task with Svelte and shared design tokens.</p>
      <label class="mt-4 block text-xs font-medium text-muted-foreground" for="task-title">Task title</label>
      <input id="task-title" bind:value={title} class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      <div class="mt-4 flex items-center justify-between gap-3">
        <span class="text-sm text-muted-foreground" role="status">{saved ? `Added: ${title || 'Untitled task'}` : 'Ready to add'}</span>
        <button class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" onclick={() => (saved = true)}>
          Add task
        </button>
      </div>
    </section>
  {/if}
</main>
