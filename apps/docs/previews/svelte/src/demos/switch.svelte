<script lang="ts">
  let checked = $state(true);
</script>

<div class="flex flex-wrap items-center gap-3">
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    class="inline-flex h-5 w-9 items-center rounded-full transition-colors"
    class:bg-primary={checked}
    class:bg-input={!checked}
    onclick={() => (checked = !checked)}
  >
    <span
      class="block size-4 rounded-full bg-background shadow transition-transform"
      class:translate-x-[18px]={checked}
      class:translate-x-0.5={!checked}
    ></span>
  </button>
  <span class="text-sm font-medium">Surface this task at the top</span>
</div>
