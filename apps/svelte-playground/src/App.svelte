<script lang="ts">
import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
import { ListTodoIcon, PenSquareIcon } from 'lucide-svelte';

import FormsView from './views/forms-view.svelte';
import TodosView from './views/todos-view.svelte';
import AppShell from '@package/pro-svelte/src/layout/app-shell.svelte';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

const navItems = [
  { label: 'Todos', path: '/todos', icon: ListTodoIcon },
  { label: 'Form blocks', path: '/forms', icon: PenSquareIcon },
];

let activePath = $state('/todos');
</script>

<QueryClientProvider client={queryClient}>
  <AppShell title="Universal Blocks — Svelte" {navItems} {activePath} onnavigate={(p) => (activePath = p)}>
    {#snippet headerExtra()}
      <span></span>
    {/snippet}
    {#snippet children()}
      {#if activePath === '/todos'}
        <TodosView />
      {:else}
        <FormsView />
      {/if}
    {/snippet}
  </AppShell>
</QueryClientProvider>
