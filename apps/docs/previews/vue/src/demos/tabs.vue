<script setup lang="ts">
import { ref } from 'vue';

const active = ref('preview');
</script>

<template>
  <div class="mx-auto w-full max-w-sm">
    <div class="inline-flex items-center gap-1 rounded-lg bg-muted p-1">
      <button
        v-for="tab in ['preview', 'code']"
        :key="tab"
        type="button"
        role="tab"
        :aria-selected="active === tab"
        class="rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors"
        :class="active === tab ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
        @click="active = tab"
      >
        {{ tab }}
      </button>
    </div>
    <p v-if="active === 'preview'" class="mt-3 text-sm text-muted-foreground">The rendered output lives here.</p>
    <p v-else class="mt-3 text-sm text-muted-foreground">The source lives here.</p>
  </div>
</template>
