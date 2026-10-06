<script setup lang="ts">
import { ref } from 'vue';

const checked = ref(true);
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <button
      type="button"
      role="switch"
      :aria-checked="checked"
      class="inline-flex h-5 w-9 items-center rounded-full transition-colors"
      :class="checked ? 'bg-primary' : 'bg-input'"
      @click="checked = !checked"
    >
      <span
        class="block size-4 rounded-full bg-background shadow transition-transform"
        :class="checked ? 'translate-x-[18px]' : 'translate-x-0.5'"
      />
    </button>
    <span class="text-sm font-medium">Surface this task at the top</span>
  </div>
</template>
