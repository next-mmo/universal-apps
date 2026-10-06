<script setup lang="ts">
import { ref } from 'vue';

const items = [
  {
    value: 'item-1',
    question: 'Is it accessible?',
    answer: 'Yes. Markup and state are plain Vue with the shared design tokens.',
  },
  {
    value: 'item-2',
    question: 'Is it animated?',
    answer: 'Panels toggle with Vue transitions; the tokens stay identical across frameworks.',
  },
  {
    value: 'item-3',
    question: 'Can multiple panels stay open?',
    answer: 'Yes — track a set of open values instead of a single one.',
  },
];

const open = ref<string | null>(null);
const toggle = (value: string) => {
  open.value = open.value === value ? null : value;
};
</script>

<template>
  <div class="mx-auto w-full max-w-sm">
    <div v-for="item in items" :key="item.value" class="border-b border-border">
      <button
        type="button"
        class="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-foreground"
        :aria-expanded="open === item.value"
        @click="toggle(item.value)"
      >
        {{ item.question }}
        <span class="text-muted-foreground transition-transform" :class="open === item.value ? 'rotate-180' : ''">⌄</span>
      </button>
      <p v-show="open === item.value" class="pb-4 text-sm text-muted-foreground">{{ item.answer }}</p>
    </div>
  </div>
</template>
