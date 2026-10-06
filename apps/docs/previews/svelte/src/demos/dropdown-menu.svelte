<script lang="ts">
  let open = $state(false);
</script>

<div class="relative inline-block">
  <button
    type="button"
    aria-label="Row actions"
    aria-haspopup="menu"
    aria-expanded={open}
    class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background transition-colors hover:bg-accent hover:text-accent-foreground"
    onclick={() => (open = !open)}
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
  </button>
  {#if open}
    <div class="absolute left-0 top-full z-10 mt-2 w-44 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md">
      <p class="px-2 py-1.5 text-sm font-medium">Actions</p>
      <button type="button" class="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent" onclick={() => (open = false)}>Mark done</button>
      <button type="button" class="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent" onclick={() => (open = false)}>Duplicate</button>
      <div class="-mx-1 my-1 h-px bg-border"></div>
      <button type="button" class="w-full rounded-sm px-2 py-1.5 text-left text-sm text-destructive hover:bg-accent" onclick={() => (open = false)}>Delete</button>
    </div>
  {/if}
</div>
