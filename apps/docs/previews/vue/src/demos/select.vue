<script setup lang="ts">
import { ref } from 'vue';

const priority = ref('normal');
</script>

<template>
  <select
    v-model="priority"
    aria-label="Priority"
    class="h-9 w-44 rounded-[10px] border border-input bg-transparent px-3 text-sm text-foreground"
  >
    <option value="low">Low</option>
    <option value="normal">Normal</option>
    <option value="high">High</option>
  </select>
</template>
