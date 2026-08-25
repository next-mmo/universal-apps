<script setup lang="ts">
import type { Component } from 'vue';

export interface NavItem {
  label: string;
  path: string;
  icon?: Component;
}

defineProps<{
  title: string;
  navItems: Array<NavItem>;
  activePath: string;
}>();

const emit = defineEmits<{ navigate: [path: string] }>();
</script>

<template>
  <div class="flex min-h-screen bg-background text-foreground">
    <aside
      class="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border/70 bg-sidebar backdrop-blur-2xl md:flex"
    >
      <div class="flex h-14 items-center border-b border-border/60 px-5 text-[15px] font-semibold tracking-[-0.02em]">
        {{ title }}
      </div>
      <nav class="flex flex-1 flex-col gap-0.5 p-2.5">
        <button
          v-for="item in navItems"
          :key="item.path"
          type="button"
          class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-100"
          :class="
            activePath === item.path || activePath.startsWith(`${item.path}/`)
              ? 'bg-primary font-medium text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          "
          @click="emit('navigate', item.path)"
        >
          <component :is="item.icon" v-if="item.icon" class="size-4" />
          {{ item.label }}
        </button>
      </nav>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header
        class="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-border/70 bg-sidebar/80 px-4 backdrop-blur-2xl md:px-6"
      >
        <div class="flex items-center gap-4 overflow-x-auto md:hidden">
          <button
            v-for="item in navItems"
            :key="item.path"
            type="button"
            class="whitespace-nowrap text-[13px]"
            :class="activePath === item.path ? 'font-semibold text-primary' : 'text-muted-foreground'"
            @click="emit('navigate', item.path)"
          >
            {{ item.label }}
          </button>
        </div>
        <span class="hidden text-sm text-muted-foreground md:inline">{{ title }}</span>
        <div class="flex items-center gap-2"><slot name="header-extra" /></div>
      </header>

      <main class="flex-1 p-4 md:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
