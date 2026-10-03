<script setup lang="ts">
import { ref } from 'vue';

const open = ref(false);
</script>

<template>
  <div class="relative inline-block">
    <button
      type="button"
      aria-expanded="open"
      class="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
      @click="open = !open"
    >
      Open popover
    </button>
    <div v-if="open" class="absolute left-0 top-full z-10 mt-2 w-64 rounded-lg border border-border bg-popover p-4 text-sm text-popover-foreground shadow-md">
      <p class="font-medium">Popover title</p>
      <p class="text-muted-foreground">Any content can live here — forms, filters, hints.</p>
    </div>
  </div>
</template>
