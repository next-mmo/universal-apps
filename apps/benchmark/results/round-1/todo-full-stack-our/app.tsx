import { useMemo, useState } from 'react';

import { ProCrudPage, defineProResource } from '@package/pro/crud';

import { selectTodos, useBenchmarkTodos, validateTodoText } from './model';

import type { ProCrudAction } from '@package/pro/crud';
import type { Todo } from './model';

/**
 * Row view model handed to the CRUD block. Derived fields keep the table DSL
 * declarative without teaching the block about the domain type.
 */
type TodoRow = {
  id: number;
  text: string;
  createdAt: number;
  done: boolean;
  status: { label: string; variant: 'success' | 'outline' };
};

type TodoFormValues = { text: string };
type TodoFilter = 'all' | 'active' | 'done';

const FILTERS: ReadonlyArray<{ value: TodoFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'done', label: 'Done' },
];

function toRow(todo: Todo): TodoRow {
  return {
    id: todo.id,
    text: todo.text,
    createdAt: todo.createdAt,
    done: todo.done,
    status: todo.done
      ? { label: 'Done', variant: 'success' }
      : { label: 'Open', variant: 'outline' },
  };
}

/** Adapts the shared domain validator to the block's field-validator signature. */
function requireTodoText(value: unknown): string | undefined {
  return validateTodoText(String(value ?? ''));
}

const resource = defineProResource<TodoRow, TodoFormValues>({
  id: 'todos',
  title: 'Tasks',
  description: 'Create, edit, complete, and remove tasks.',
  getRowId: (row) => String(row.id),
  columns: [
    { key: 'text', header: 'Task', valueType: 'text' },
    { key: 'status', header: 'Status', valueType: 'status' },
    { key: 'createdAt', header: 'Created', valueType: 'date' },
  ],
  table: { searchPlaceholder: 'Filter current view…' },
  form: {
    schema: [
      {
        fields: [
          {
            name: 'text',
            label: 'Task',
            type: 'text',
            placeholder: 'What needs doing?',
            validators: [requireTodoText],
          },
        ],
      },
    ],
    create: { title: 'New task', values: { text: '' }, submitLabel: 'Add task' },
    edit: {
      title: 'Edit task',
      values: (row) => ({ text: row.text }),
      submitLabel: 'Save task',
    },
  },
  labels: {
    create: 'New task',
    removeTitle: 'Delete task?',
    removeDescription: 'The task is removed from storage. This cannot be undone.',
    confirmRemove: 'Delete',
  },
});

export function App() {
  const { todos, ready, error, clearError, add, update, toggle, remove, clearDone } =
    useBenchmarkTodos();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<TodoFilter>('all');

  /** R6: the rendered rows are exactly the domain selection for filter + search. */
  const rows = useMemo(
    () => selectTodos(todos, filter, search).map(toRow),
    [todos, filter, search],
  );
  const doneCount = useMemo(() => todos.filter((todo) => todo.done).length, [todos]);

  /** R1: create through `add`, rejecting blank text with the shared message. */
  async function createTask(values: TodoFormValues): Promise<void> {
    const message = validateTodoText(values.text);
    if (message !== undefined) throw new Error(message);
    if (!(await add(values.text))) throw new Error('Could not create task');
  }

  /** R2: edit through `update`, same validation rule as create. */
  async function updateTask(row: TodoRow, values: TodoFormValues): Promise<void> {
    const message = validateTodoText(values.text);
    if (message !== undefined) throw new Error(message);
    if (!(await update(row.id, values.text))) throw new Error('Could not update task');
  }

  /** R3: one toggle action whose label reflects the row's current state. */
  const actions: Array<ProCrudAction<TodoRow>> = [
    { label: 'Mark done', hidden: (row) => row.done, onSelect: (row) => toggle(row.id) },
    { label: 'Reopen', hidden: (row) => !row.done, onSelect: (row) => toggle(row.id) },
  ];

  /** R6 search + filter controls and R5 clear-completed. */
  const headerActions = (
    <div className='flex flex-wrap items-center gap-2'>
      <input
        type='search'
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder='Search tasks…'
        aria-label='Search tasks'
        className='h-9 w-48 rounded-md border border-border bg-card px-3 text-sm text-card-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40'
      />
      <div className='flex items-center gap-1' role='group' aria-label='Filter tasks'>
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type='button'
            aria-pressed={filter === option.value}
            onClick={() => setFilter(option.value)}
            className={
              filter === option.value
                ? 'h-9 rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground'
                : 'h-9 rounded-md border border-border bg-card px-3 text-[13px] font-medium text-card-foreground hover:bg-accent'
            }
          >
            {option.label}
          </button>
        ))}
      </div>
      <button
        type='button'
        disabled={!ready || doneCount === 0}
        onClick={() => {
          void clearDone().catch(() => undefined);
        }}
        className='h-9 rounded-md border border-border bg-card px-3 text-[13px] font-medium text-card-foreground hover:bg-accent disabled:opacity-40'
      >
        Clear completed
      </button>
    </div>
  );

  /** R7 loading indication carrying `aria-busy`; R8 error region with a clear control. */
  const toolbar = (
    <div className='flex flex-wrap items-center gap-2'>
      <p className='text-xs text-muted-foreground' aria-busy={!ready}>
        {ready ? `${rows.length} of ${todos.length} tasks` : 'Loading tasks…'}
      </p>
      {error !== undefined && (
        <div
          role='alert'
          className='flex items-center gap-2 rounded-md border border-destructive/40 px-2 py-1 text-xs font-medium text-destructive'
        >
          <span>{error}</span>
          <button type='button' onClick={clearError} className='underline underline-offset-2'>
            Dismiss
          </button>
        </div>
      )}
    </div>
  );

  /** R9: shown by the block whenever the selection is empty. */
  const empty = (
    <p className='text-sm text-muted-foreground'>
      {todos.length === 0
        ? 'No tasks yet. Use “New task” to add the first one.'
        : 'No tasks match the current search and filter.'}
    </p>
  );

  return (
    <ProCrudPage
      resource={resource}
      controller={{
        rows,
        loading: !ready,
        create: createTask,
        update: updateTask,
        remove: (row) => remove(row.id),
      }}
      actions={actions}
      headerActions={headerActions}
      toolbar={toolbar}
      empty={empty}
    />
  );
}