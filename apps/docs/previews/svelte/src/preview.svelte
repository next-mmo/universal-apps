<script lang="ts">
  let title = $state('Ship the browser docs');
  let saved = $state(false);
</script>

<main class="min-h-screen bg-background p-4 text-foreground">
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
</main>
