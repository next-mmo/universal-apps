import { useMemo } from 'react';
import { ProCrudPage, defineProResource } from '@package/pro/crud';
import type { ProCrudController } from '@package/pro/crud';
import { useBenchmarkTodos, type Todo } from './model';

type Values = { text: string };
const resource = defineProResource<Todo, Values>({
  id: 'benchmark-todos', title: 'Todo administration', description: 'Shared CRUD block benchmark', getRowId: (row) => String(row.id),
  columns: [
    { key: 'text', header: 'Task', valueType: 'text' },
    { key: 'done', header: 'Status', valueType: 'status', accessor: 'done' },
    { key: 'createdAt', header: 'Created', valueType: 'date', accessor: 'createdAt' },
  ],
  table: { features: { sorting: true, globalFilter: true, pagination: true, rowSelection: true }, searchPlaceholder: 'Search tasks' },
  form: {
    schema: [{ title: 'Task details', fields: [{ name: 'text', label: 'Task', type: 'text', required: true }] }],
    create: { title: 'Create task', values: { text: '' }, submitLabel: 'Create' },
    edit: { title: 'Edit task', values: (row) => ({ text: row.text }), submitLabel: 'Save' },
  },
  labels: { create: 'New task', edit: 'Edit', remove: 'Delete', removeTitle: 'Delete task?', confirmRemove: 'Delete' },
});

export function App() {
  const state = useBenchmarkTodos();
  const controller = useMemo<ProCrudController<Todo, Values>>(() => ({
    rows: state.todos, loading: !state.ready || state.saving, error: state.error,
    create: (values) => state.add(values.text), update: (row, values) => state.update(row.id, values.text),
    remove: (row) => state.remove(row.id),
  }), [state]);
  return <main className='mx-auto min-h-dvh max-w-5xl px-6 py-10'><ProCrudPage resource={resource} controller={controller} actions={[{ label: 'Toggle', onSelect: (row) => state.toggle(row.id) }]} /></main>;
}
