<script setup lang="ts">
const tasks = [
  { text: 'Write docs', status: 'In progress' },
  { text: 'Ship release', status: 'Open' },
];
</script>

<template>
  <div class="mx-auto w-full max-w-sm overflow-hidden rounded-lg border border-border">
    <table class="w-full text-sm">
      <thead class="bg-muted/50">
        <tr class="border-b border-border">
          <th class="px-3 py-2.5 text-left text-xs font-semibold tracking-wide text-muted-foreground">Task</th>
          <th class="px-3 py-2.5 text-left text-xs font-semibold tracking-wide text-muted-foreground">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="task in tasks" :key="task.text" class="border-b border-border last:border-b-0">
          <td class="px-3 py-2.5">{{ task.text }}</td>
          <td class="px-3 py-2.5 text-muted-foreground">{{ task.status }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
