<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
  breadcrumbs?: Array<string>;
}>();
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div class="flex flex-col gap-1">
        <nav v-if="(breadcrumbs?.length ?? 0) > 0" aria-label="Breadcrumb" class="text-xs text-muted-foreground">
          {{ breadcrumbs?.join(' / ') }}
        </nav>
        <h1 class="text-2xl font-bold tracking-[-0.02em]">{{ title }}</h1>
        <p v-if="description" class="text-sm text-muted-foreground">{{ description }}</p>
      </div>
      <div class="flex items-center gap-2"><slot name="extra" /></div>
    </div>

    <div class="flex flex-col gap-6">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="border-t pt-4 text-xs text-muted-foreground">
      <slot name="footer" />
    </footer>
  </div>
</template>
