<script lang="ts">
import { createQuery, useQueryClient } from '@tanstack/svelte-query';

import { getTodoStore } from '@package/tauri-api/src/todo-storage';
import type { Todo } from '@package/core/src/todo';
import type { ProColumnDef } from '@package/pro-core/src/table/columns';
import type { TableQuery } from '@package/pro-core/src/table/features';
import PageContainer from '@package/pro-svelte/src/layout/page-container.svelte';
import ProDataTable from '@package/pro-svelte/src/data-table/pro-data-table.svelte';
import ProFormDialog from '@package/pro-svelte/src/form/pro-form-dialog.svelte';

interface TodoRow {
  id: string;
  text: string;
  createdAt: number;
  status: { label: string; variant: 'success' | 'outline' };
}

const store = getTodoStore();
const queryClient = useQueryClient();
let createOpen = $state(false);
let query = $state<TableQuery>({ page: 0, pageSize: 10 });

const todosQuery = createQuery(() => ({
  queryKey: ['todos'],
  queryFn: () => store.load(),
}));

const rows = $derived<TodoRow[]>(
  (todosQuery.data ?? []).map((todo: Todo) => ({
    id: String(todo.id),
    text: todo.text,
    createdAt: todo.id,
    status: todo.done
      ? { label: 'Done', variant: 'success' as const }
      : { label: 'Open', variant: 'outline' as const },
  })),
);

async function persist(change: (todos: Array<Todo>) => Array<Todo>) {
  const todos = await store.load();
  await store.save(change(todos));
  await queryClient.invalidateQueries({ queryKey: ['todos'] });
}

const columns: Array<ProColumnDef<Record<string, unknown>>> = [
  { key: 'text', header: 'Task', valueType: 'text' },
  { key: 'createdAt', header: 'Created', valueType: 'date', accessor: 'createdAt' },
  { key: 'status', header: 'Status', valueType: 'status' },
  {
    key: 'actions',
    header: '',
    valueType: 'actions',
    actions: [
      { label: 'Done', onSelect: (row) => void persist((todos) => todos.map((t) => (String(t.id) === row.id ? { ...t, done: !t.done } : t))) },
      { label: 'Delete', destructive: true, onSelect: (row) => void persist((todos) => todos.filter((t) => String(t.id) !== row.id)) },
    ],
  },
];

const createSchema = [
  {
    title: 'New task',
    fields: [
      {
        name: 'text',
        label: 'Task',
        type: 'text' as const,
        placeholder: 'What needs doing?',
        required: true,
      },
    ],
  },
];

async function handleCreate(values: Record<string, unknown>) {
  await persist((todos) => [...todos, { id: Date.now(), text: String(values.text), done: false }]);
}
</script>

<PageContainer
  title="Todos"
  description="Svelte adapter of the pro DataTable — shared DSL and universal bridge."
  breadcrumbs={['Svelte', 'Data', 'Todos']}
>
  <ProDataTable
    {columns}
    data={rows as unknown as Array<Record<string, unknown>>}
    loading={todosQuery.isPending}
    error={todosQuery.error ?? undefined}
    query={query}
    totalRows={rows.length}
    onQueryChange={(next) => (query = next)}
    searchPlaceholder="Search tasks…"
  />

  <button
    type="button"
    class="fixed right-6 bottom-6 h-11 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-overlay)] transition-all hover:brightness-110 active:scale-[0.98]"
    onclick={() => (createOpen = true)}
  >
    + New task
  </button>

  <ProFormDialog
    open={createOpen}
    onclose={() => (createOpen = false)}
    title="New task"
    schema={createSchema}
    defaultValues={{}}
    submitLabel="Add task"
    onSubmit={handleCreate}
  />
</PageContainer>
