import { useState } from 'react';

import { useAddTodo, useRemoveTodo, useToggleTodo, useTodos } from '../lib/todo-queries';
import type { TodoRow } from '../lib/todo-service';
import { ProDataTable } from '@package/pro/src/data-table/pro-data-table';
import { ProFormDialog } from '@package/pro/src/form/pro-form-dialog';
import { PageContainer } from '@package/pro/src/layout/page-container';
import { Button } from '@package/ui/src/components/ui/button';
import { PlusIcon } from 'lucide-react';

import type { ProColumnDef } from '@package/pro-core/src/table/columns';

const columns: Array<ProColumnDef<TodoRow>> = [
  { key: 'text', header: 'Task', valueType: 'text' },
  {
    key: 'priority',
    header: 'Priority',
    valueType: 'badge',
    hiddenByDefault: true,
  },
  { key: 'createdAt', header: 'Created', valueType: 'date', accessor: 'createdAt' },
  { key: 'status', header: 'Status', valueType: 'status' },
  {
    key: 'actions',
    header: '',
    valueType: 'actions',
    actions: [],
  },
];

/** Actions need row data at render time; wired inside the page component. */
function useActionColumns(): Array<ProColumnDef<TodoRow>> {
  const toggle = useToggleTodo();
  const remove = useRemoveTodo();

  return [
    ...columns.slice(0, -1),
    {
      key: 'actions',
      header: '',
      valueType: 'actions',
      actions: [
        {
          label: 'Done',
          onSelect: (row) => toggle.mutate(Number(row.id)),
        },
        {
          label: 'Delete',
          destructive: true,
          onSelect: (row) => remove.mutate(Number(row.id)),
        },
      ],
    },
  ];
}

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

export default function TodosPage() {
  const todos = useTodos();
  const actionColumns = useActionColumns();
  const addTodo = useAddTodo();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <PageContainer
      title='Todos'
      description='ProTable-style block on TanStack Table + Query over the universal storage bridge.'
      breadcrumbs={['App', 'Data', 'Todos']}
    >
      <ProDataTable<TodoRow>
        columns={actionColumns}
        data={todos.data ?? []}
        loading={todos.isPending}
        error={todos.error ?? undefined}
        onRetry={() => void todos.refetch()}
        getRowId={(row) => row.id}
        features={{ sorting: true, globalFilter: true, pagination: true, rowSelection: true }}
        onRefresh={() => void todos.refetch()}
        searchPlaceholder='Search tasks…'
        toolbarExtra={
          <Button size='sm' onClick={() => setCreateOpen(true)}>
            <PlusIcon />
            New task
          </Button>
        }
      />

      <ProFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title='New task'
        description='Stored through the same Rust/localStorage bridge as everywhere else.'
        schema={createSchema}
        defaultValues={{}}
        submitLabel='Add task'
        pending={addTodo.isPending}
        onSubmit={async (values) => {
          await addTodo.mutateAsync(String(values.text));
        }}
      />
    </PageContainer>
  );
}
