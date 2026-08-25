<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, ref } from 'vue';

import { getTodoStore } from '@package/tauri-api/src/todo-storage';
import type { Todo } from '@package/core/src/todo';
import type { ProColumnDef } from '@package/pro-core/src/table/columns';
import type { TableQuery } from '@package/pro-core/src/table/features';
import ProDataTable from '@package/pro-vue/src/data-table/pro-data-table.vue';
import ProFormDialog from '@package/pro-vue/src/form/pro-form-dialog.vue';
import PageContainer from '@package/pro-vue/src/layout/page-container.vue';

interface TodoRow {
  id: string;
  text: string;
  createdAt: number;
  status: { label: string; variant: 'success' | 'outline' };
}

const store = getTodoStore();
const queryClient = useQueryClient();
const createOpen = ref(false);
const query = ref<TableQuery>({ page: 0, pageSize: 10 });

const todosQuery = useQuery({
  queryKey: ['todos'],
  queryFn: () => store.load(),
});

const rows = computed<TodoRow[]>(() =>
  (todosQuery.data.value ?? []).map((todo: Todo) => ({
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

const toggle = (id: string) =>
  void persist((todos) => todos.map((t) => (String(t.id) === id ? { ...t, done: !t.done } : t)));
const remove = (id: string) =>
  void persist((todos) => todos.filter((t) => String(t.id) !== id));

const columns = computed<Array<ProColumnDef<Record<string, unknown>>>>(
  () =>
    [
      { key: 'text', header: 'Task', valueType: 'text' },
      { key: 'createdAt', header: 'Created', valueType: 'date', accessor: 'createdAt' },
      { key: 'status', header: 'Status', valueType: 'status' },
      {
        key: 'actions',
        header: '',
        valueType: 'actions',
        actions: [
          { label: 'Done', onSelect: (row) => toggle(row.id as string) },
          { label: 'Delete', destructive: true, onSelect: (row) => remove(row.id as string) },
        ],
      },
    ] satisfies Array<ProColumnDef<Record<string, unknown>>>,
);

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

<template>
  <PageContainer
    title="Todos"
    description="Vue adapter of the pro DataTable — same column DSL and universal bridge."
    :breadcrumbs="['Vue', 'Data', 'Todos']"
  >
    <ProDataTable
      :columns="columns"
      :data="rows as unknown as Array<Record<string, unknown>>"
      :loading="todosQuery.isPending.value"
      :error="todosQuery.error.value ?? undefined"
      :query="query"
      :total-rows="rows.length"
      :on-query-change="(next) => (query = next)"
      search-placeholder="Search tasks…"
    >
      <template v-if="false" />
    </ProDataTable>

    <button
      type="button"
      class="fixed bottom-6 right-6 h-11 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-overlay)] transition-all hover:brightness-110 active:scale-[0.98]"
      @click="createOpen = true"
    >
      + New task
    </button>

    <ProFormDialog
      v-model:open="createOpen"
      title="New task"
      :schema="createSchema"
      :default-values="{}"
      submit-label="Add task"
      :on-submit="handleCreate"
    />
  </PageContainer>
</template>
