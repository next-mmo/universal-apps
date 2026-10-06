<script lang="ts">
  let active = $state('preview');
  const tabs = ['preview', 'code'];
</script>

<div class="mx-auto w-full max-w-sm">
  <div class="inline-flex items-center gap-1 rounded-lg bg-muted p-1">
    {#each tabs as tab (tab)}
      <button
        type="button"
        role="tab"
        aria-selected={active === tab}
        class="rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors"
        class:bg-background={active === tab}
        class:text-foreground={active === tab}
        class:shadow-sm={active === tab}
        class:text-muted-foreground={active !== tab}
        onclick={() => (active = tab)}
      >
        {tab}
      </button>
    {/each}
  </div>
  {#if active === 'preview'}
    <p class="mt-3 text-sm text-muted-foreground">The rendered output lives here.</p>
  {:else}
    <p class="mt-3 text-sm text-muted-foreground">The source lives here.</p>
  {/if}
</div>
