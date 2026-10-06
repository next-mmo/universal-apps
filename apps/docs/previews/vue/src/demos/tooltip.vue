<template>
  <div class="flex flex-wrap items-center gap-3">
    <span class="group relative inline-flex">
      <button
        type="button"
        aria-label="Info"
        class="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
      </button>
      <span
        role="tooltip"
        class="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100"
      >
        More information
      </span>
    </span>
    <span class="text-sm text-muted-foreground">Hover the icon button.</span>
  </div>
</template>
