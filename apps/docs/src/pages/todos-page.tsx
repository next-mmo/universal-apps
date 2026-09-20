import { ProCrudPage, defineProResource } from '@package/pro/crud';
import { useTodoCrud } from '../lib/todo-queries';
import type { TodoFormValues, TodoRow } from '../lib/todo-service';

const resource = defineProResource<TodoRow, TodoFormValues>({
  id: 'todos',
  title: 'Todos',
  description: 'Universal storage with a config-first table and form.',
  breadcrumbs: ['App', 'Data', 'Todos'],
  getRowId: (row) => row.id,
  columns: [
    { key: 'text', header: 'Task', valueType: 'text' },
    { key: 'priority', header: 'Priority', valueType: 'badge', hiddenByDefault: true },
    { key: 'createdAt', header: 'Created', valueType: 'date' },
    { key: 'status', header: 'Status', valueType: 'status' },
  ],
  table: {
    features: { sorting: true, globalFilter: true, pagination: true, rowSelection: true },
    searchPlaceholder: 'Search tasks…',
  },
  form: {
    schema: [{ fields: [{ name: 'text', label: 'Task', type: 'text', placeholder: 'What needs doing?', required: true }] }],
    create: { title: 'New task', values: { text: '' }, submitLabel: 'Add task' },
  },
  labels: { create: 'New task' },
});

export default function TodosPage() {
  return <ProCrudPage resource={resource} {...useTodoCrud()} />;
}
