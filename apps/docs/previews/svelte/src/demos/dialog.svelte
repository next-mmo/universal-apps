<script lang="ts">
  let open = $state(false);
</script>

<div>
  <button
    type="button"
    class="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
    onclick={() => (open = true)}
  >
    Open dialog
  </button>
  {#if open}
    <div class="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="presentation" onclick={(event) => { if (event.target === event.currentTarget) open = false; }}>
      <div role="dialog" aria-modal="true" class="w-full max-w-sm rounded-xl border border-border bg-popover p-6 text-popover-foreground shadow-lg">
        <div class="flex flex-col gap-2">
          <h2 class="text-lg font-semibold leading-none">Delete task?</h2>
          <p class="text-sm text-muted-foreground">This action cannot be undone.</p>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" class="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium transition-colors hover:bg-accent" onclick={() => (open = false)}>Cancel</button>
          <button type="button" class="inline-flex h-8 items-center justify-center rounded-md bg-destructive px-3 text-xs font-medium text-white transition-colors hover:bg-destructive/90" onclick={() => (open = false)}>Delete</button>
        </div>
      </div>
    </div>
  {/if}
</div>
