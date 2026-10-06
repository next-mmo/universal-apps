<script setup lang="ts">
import { computed, ref, type Component } from 'vue';

import AccordionDemo from './demos/accordion.vue';
import BadgeDemo from './demos/badge.vue';
import ButtonDemo from './demos/button.vue';
import CardDemo from './demos/card.vue';
import CheckboxDemo from './demos/checkbox.vue';
import DialogDemo from './demos/dialog.vue';
import DropdownMenuDemo from './demos/dropdown-menu.vue';
import InputDemo from './demos/input.vue';
import LabelDemo from './demos/label.vue';
import PopoverDemo from './demos/popover.vue';
import SelectDemo from './demos/select.vue';
import SeparatorDemo from './demos/separator.vue';
import SkeletonDemo from './demos/skeleton.vue';
import SwitchDemo from './demos/switch.vue';
import TableDemo from './demos/table.vue';
import TabsDemo from './demos/tabs.vue';
import TextareaDemo from './demos/textarea.vue';
import TooltipDemo from './demos/tooltip.vue';

/**
 * Per-component demos selected by the docs panel via `?component=<id>`.
 * Without that parameter (a direct visit to /previews/vue/) the original
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
const Demo = computed(() => demos[componentId] ?? null);

const title = ref('Ship the browser docs');
const saved = ref(false);
</script>

<template>
  <main class="min-h-screen bg-background p-4 text-foreground">
    <component :is="Demo" v-if="Demo" />
    <section v-else class="task-card mx-auto max-w-lg rounded-xl border border-border bg-card p-5 shadow-sm">
      <h1 class="text-lg font-semibold">New task</h1>
      <p class="mt-1 text-sm text-muted-foreground">Create a task with Vue and shared design tokens.</p>
      <label class="mt-4 block text-xs font-medium text-muted-foreground" for="task-title">Task title</label>
      <input id="task-title" v-model="title" class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      <div class="mt-4 flex items-center justify-between gap-3">
        <span class="text-sm text-muted-foreground" role="status">{{ saved ? `Added: ${title || 'Untitled task'}` : 'Ready to add' }}</span>
        <button class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" @click="saved = true">
          Add task
        </button>
      </div>
    </section>
  </main>
</template>
