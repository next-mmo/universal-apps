<template>
  <section class="mx-auto w-full max-w-sm rounded-xl border border-border bg-card text-card-foreground shadow-sm">
    <div class="flex flex-col gap-1.5 p-6">
      <h3 class="font-semibold leading-none tracking-tight">New task</h3>
      <p class="text-sm text-muted-foreground">Track something that needs doing.</p>
    </div>
    <div class="grid gap-2 p-6 pt-0">
      <label class="text-sm font-medium leading-none" for="vue-card-demo-task">Task</label>
      <input id="vue-card-demo-task" placeholder="What needs doing?" class="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm" />
    </div>
    <div class="flex items-center justify-end p-6 pt-0">
      <button type="button" class="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">Create</button>
    </div>
  </section>
</template>
