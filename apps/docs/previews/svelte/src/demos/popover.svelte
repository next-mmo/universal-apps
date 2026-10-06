<script lang="ts">
  let open = $state(false);
</script>

<div class="relative inline-block">
  <button
    type="button"
    aria-expanded={open}
    class="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
    onclick={() => (open = !open)}
  >
    Open popover
  </button>
  {#if open}
    <div class="absolute left-0 top-full z-10 mt-2 w-64 rounded-lg border border-border bg-popover p-4 text-sm text-popover-foreground shadow-md">
      <p class="font-medium">Popover title</p>
      <p class="text-muted-foreground">Any content can live here — forms, filters, hints.</p>
    </div>
  {/if}
</div>
