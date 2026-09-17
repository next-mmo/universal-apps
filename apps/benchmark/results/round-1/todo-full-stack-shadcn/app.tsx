import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Badge, Button, Card, Input } from './components';
import { selectTodos, useBenchmarkTodos, validateTodoText, type Todo } from './model';

type Filter = 'all' | 'active' | 'done';

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'done', label: 'Done' },
];

export function App() {
  const { todos, ready, saving, error, clearError, add, update, toggle, remove, clearDone } = useBenchmarkTodos();

  const [text, setText] = useState('');
  const [composerMessage, setComposerMessage] = useState<string>();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number>();
  const [draft, setDraft] = useState('');
  const [editMessage, setEditMessage] = useState<string>();

  const visible = useMemo(() => selectTodos(todos, filter, search), [todos, filter, search]);
  const doneCount = useMemo(() => todos.filter((todo) => todo.done).length, [todos]);
  const pendingCount = todos.length - doneCount;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = validateTodoText(text);
    if (message) {
      setComposerMessage(message);
      return;
    }
    setComposerMessage(undefined);
    const submitted = text;
    setText('');
    void add(submitted);
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setDraft(todo.text);
    setEditMessage(undefined);
  };

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>, id: number) => {
    event.preventDefault();
    const message = validateTodoText(draft);
    if (message) {
      setEditMessage(message);
      return;
    }
    setEditMessage(undefined);
    setEditingId(undefined);
    void update(id, draft);
  };

  return (
    <main className='mx-auto flex min-h-dvh max-w-2xl flex-col gap-5 px-5 py-8 sm:py-12'>
      <header className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Tasks</h1>
          <p className='mt-1 text-sm text-slate-500'>
            {ready ? `${pendingCount} active · ${doneCount} done` : 'Loading tasks…'}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant='secondary' data-testid='total-count'>
            {todos.length} total
          </Badge>
          <Button variant='outline' size='sm' onClick={() => void clearDone()} disabled={doneCount === 0}>
            Clear completed
          </Button>
        </div>
      </header>

      {error ? (
        <div
          role='alert'
          className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'
        >
          <span>{error}</span>
          <Button variant='destructive' size='sm' onClick={clearError}>
            Dismiss
          </Button>
        </div>
      ) : null}

      <Card className='p-4'>
        <form className='flex flex-col gap-2 sm:flex-row' onSubmit={handleSubmit} noValidate>
          <Input
            value={text}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setText(event.target.value);
              if (composerMessage) setComposerMessage(undefined);
            }}
            placeholder='Add a task…'
            aria-label='Task text'
            aria-invalid={composerMessage ? true : undefined}
            className='flex-1'
          />
          <Button type='submit' disabled={saving}>
            Add task
          </Button>
        </form>
        {composerMessage ? (
          <p className='mt-2 text-sm text-red-600' role='alert'>
            {composerMessage}
          </p>
        ) : null}
      </Card>

      <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        <Input
          value={search}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
          placeholder='Search tasks…'
          aria-label='Search tasks'
          type='search'
          className='sm:flex-1'
        />
        <div className='flex items-center gap-1' role='group' aria-label='Filter tasks'>
          {FILTERS.map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? 'default' : 'outline'}
              size='sm'
              aria-pressed={filter === option.value}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {!ready ? (
        <Card className='p-6' aria-busy='true' aria-live='polite'>
          <p className='text-sm font-medium text-slate-600'>Loading tasks…</p>
          <div className='mt-4 flex flex-col gap-3' aria-hidden='true'>
            <div className='h-4 w-full rounded bg-slate-100' />
            <div className='h-4 w-5/6 rounded bg-slate-100' />
            <div className='h-4 w-4/6 rounded bg-slate-100' />
          </div>
        </Card>
      ) : visible.length === 0 ? (
        <Card className='p-10 text-center'>
          <p className='text-sm font-medium text-slate-700'>No tasks to show</p>
          <p className='mt-1 text-sm text-slate-500'>
            {todos.length === 0
              ? 'Add your first task above to get started.'
              : 'Nothing matches the current filter or search.'}
          </p>
        </Card>
      ) : (
        <Card>
          <ul className='divide-y divide-slate-200'>
            {visible.map((todo) => (
              <li key={todo.id} className='flex flex-wrap items-center gap-3 px-4 py-3'>
                {editingId === todo.id ? (
                  <>
                    <form
                      className='flex flex-1 flex-wrap items-center gap-2'
                      onSubmit={(event) => handleEditSubmit(event, todo.id)}
                      noValidate
                    >
                      <Input
                        value={draft}
                        autoFocus
                        aria-label={`Edit "${todo.text}"`}
                        aria-invalid={editMessage ? true : undefined}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          setDraft(event.target.value);
                          if (editMessage) setEditMessage(undefined);
                        }}
                        className='flex-1'
                      />
                      <Button type='submit' size='sm' disabled={saving}>
                        Save
                      </Button>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          setEditingId(undefined);
                          setEditMessage(undefined);
                        }}
                      >
                        Cancel
                      </Button>
                    </form>
                    {editMessage ? (
                      <p role='alert' className='w-full text-sm text-red-600'>
                        {editMessage}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <>
                    <label className='flex flex-1 cursor-pointer items-center gap-3'>
                      <input
                        type='checkbox'
                        checked={todo.done}
                        onChange={() => void toggle(todo.id)}
                        aria-label={`Toggle "${todo.text}"`}
                        className='size-4 shrink-0 accent-slate-900'
                      />
                      <span
                        className={
                          todo.done ? 'text-sm text-slate-400 line-through' : 'text-sm text-slate-800'
                        }
                      >
                        {todo.text}
                      </span>
                    </label>
                    <Badge variant={todo.done ? 'secondary' : 'outline'}>{todo.done ? 'Done' : 'Active'}</Badge>
                    <div className='flex items-center gap-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        aria-label={`Edit "${todo.text}"`}
                        onClick={() => startEdit(todo)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant='destructive'
                        size='sm'
                        aria-label={`Delete "${todo.text}"`}
                        onClick={() => void remove(todo.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </main>
  );
}
