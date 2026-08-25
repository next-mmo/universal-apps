<script setup lang="ts">
import { ListTodoIcon, PenSquareIcon } from 'lucide-vue-next';
import { computed, ref } from 'vue';

import FormsView from './views/forms-view.vue';
import TodosView from './views/todos-view.vue';
import AppShell from '@package/pro-vue/src/layout/app-shell.vue';

const views = {
  '/todos': { label: 'Todos', component: TodosView },
  '/forms': { label: 'Form blocks', component: FormsView },
} as const;

type ViewPath = keyof typeof views;

const activePath = ref<ViewPath>('/todos');
const navItems = computed(() => [
  { label: 'Todos', path: '/todos', icon: ListTodoIcon },
  { label: 'Form blocks', path: '/forms', icon: PenSquareIcon },
]);
</script>

<template>
  <AppShell
    title="Universal Blocks — Vue"
    :nav-items="navItems"
    :active-path="activePath"
    @navigate="activePath = $event as ViewPath"
  >
    <component :is="views[activePath].component" />
  </AppShell>
</template>
