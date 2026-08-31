import { useEffect, useMemo, useState } from 'react';
import { useTodos } from '@package/core/src/use-todos';
import { getTodoStore } from '@package/tauri-api/src/todo-storage';
import type { Todo } from '@package/core/src/todo';
import { Card, CardContent } from '@package/ui/src/components/ui/card';
import { Button } from '@package/ui/src/components/ui/button';
import { Input } from '@package/ui/src/components/ui/input';
import { Checkbox } from '@package/ui/src/components/ui/checkbox';
import { Badge } from '@package/ui/src/components/ui/badge';
import { Separator } from '@package/ui/src/components/ui/separator';
import { Skeleton } from '@package/ui/src/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@package/ui/src/components/ui/tabs';
import {
  CheckIcon,
  InboxIcon,
  MoonIcon,
  PencilIcon,
  PlusIcon,
  SunIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';

const store = getTodoStore();

type Filter = 'all' | 'active' | 'done';

export function App() {
  const { todos, loaded, addTodo, toggleTodo, updateTodo, removeTodo, clearDone } = useTodos(store);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const initial = stored ? stored === 'dark' : !!prefersDark;
    document.documentElement.classList.toggle('dark', initial);
    setDark(initial);
  }, []);

  const toggleTheme = () => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const pending = useMemo(() => todos.filter((t) => !t.done), [todos]);
  const done = useMemo(() => todos.filter((t) => t.done), [todos]);
  const visible = useMemo(
    () => (filter === 'all' ? todos : filter === 'active' ? pending : done),
    [todos, pending, done, filter],
  );
  const pct = todos.length ? Math.round((done.length / todos.length) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTodo(text);
    setText('');
    setFilter('all');
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setDraft(todo.text);
  };
  const saveEdit = () => {
    if (editingId != null) updateTodo(editingId, { text: draft });
    setEditingId(null);
  };
  const cancelEdit = () => setEditingId(null);

  return (
    <main className='mx-auto flex min-h-dvh max-w-lg flex-col gap-5 px-5 py-8 sm:py-12'>
      {/* Header */}
      <header className='flex items-start justify-between gap-3'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Tasks</h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            {loaded
              ? pct === 100 && todos.length > 0
                ? 'All done — nice work! 🎉'
                : `${pending.length} active · ${done.length} completed`
              : '…'}
          </p>
        </div>
        <div className='flex items-center gap-1.5'>
          {done.length > 0 && (
            <Button variant='ghost' size='sm' onClick={clearDone} className='text-muted-foreground'>
              <Trash2Icon className='mr-1 size-3.5' />
              Clear done
            </Button>
          )}
          <Button variant='ghost' size='icon' onClick={toggleTheme} aria-label='Toggle theme'>
            {dark ? <SunIcon className='size-4' /> : <MoonIcon className='size-4' />}
          </Button>
        </div>
      </header>

      {/* Progress */}
      {loaded && todos.length > 0 && (
        <div className='space-y-1.5'>
          <div className='flex items-center justify-between text-xs text-muted-foreground'>
            <span>Progress</span>
            <span className='font-medium tabular-nums text-foreground'>{pct}%</span>
          </div>
          <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
            <div
              className='h-full rounded-full bg-primary transition-[width] duration-500 ease-out'
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Add form */}
      <form onSubmit={handleSubmit} className='flex gap-2'>
        <Input
          placeholder='Add a task…'
          value={text}
          onChange={(e) => setText(e.target.value)}
          className='h-11 flex-1 rounded-xl text-base'
          aria-label='Add a task'
        />
        <Button
          type='submit'
          size='icon'
          className='h-11 w-11 rounded-xl'
          disabled={!text.trim()}
          aria-label='Add task'
        >
          <PlusIcon className='size-5' />
        </Button>
      </form>

      {/* Filters */}
      {loaded && todos.length > 0 && (
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList className='w-full'>
            <TabsTrigger value='all' className='flex-1'>
              All
              <Badge variant='secondary' className='ml-1 px-1.5 py-0 text-[10px]'>
                {todos.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value='active' className='flex-1'>
              Active
              <Badge variant='secondary' className='ml-1 px-1.5 py-0 text-[10px]'>
                {pending.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value='done' className='flex-1'>
              Done
              <Badge variant='secondary' className='ml-1 px-1.5 py-0 text-[10px]'>
                {done.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* List / states */}
      {!loaded ? (
        <Card className='gap-0 p-6'>
          <div className='space-y-4'>
            <Skeleton className='h-5 w-full' />
            <Skeleton className='h-5 w-5/6' />
            <Skeleton className='h-5 w-4/6' />
          </div>
        </Card>
      ) : visible.length === 0 ? (
        <Card>
          <CardContent className='flex flex-col items-center gap-3 py-12 text-center'>
            <div className='flex size-12 items-center justify-center rounded-full bg-muted'>
              {filter === 'done' ? (
                <CheckIcon className='size-6 text-muted-foreground' />
              ) : (
                <InboxIcon className='size-6 text-muted-foreground' />
              )}
            </div>
            <div>
              <p className='text-sm font-medium'>
                {filter === 'all'
                  ? 'No tasks yet'
                  : filter === 'active'
                    ? 'Nothing to do'
                    : 'No completed tasks'}
              </p>
              <p className='mt-0.5 text-xs text-muted-foreground'>
                {filter === 'done'
                  ? 'Complete a task to see it here.'
                  : 'Add one above and get going.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className='gap-0 py-1'>
          <CardContent className='px-2 py-1 sm:px-3'>
            {visible.map((todo, i) => (
              <div key={todo.id}>
                {i > 0 && <Separator className='my-1' />}
                <TodoRow
                  todo={todo}
                  editing={editingId === todo.id}
                  draft={draft}
                  setDraft={setDraft}
                  onToggle={() => toggleTodo(todo.id)}
                  onDelete={() => removeTodo(todo.id)}
                  onEdit={() => startEdit(todo)}
                  onSave={saveEdit}
                  onCancel={cancelEdit}
                />
              </div>
            ))}
          </CardContent>
          <div className='border-t px-5 py-3'>
            <p className='text-center text-[11px] text-muted-foreground'>
              Built with <span className='font-medium text-foreground/70'>@package/core</span> +
              <span className='font-medium text-foreground/70'> @package/ui</span>
            </p>
          </div>
        </Card>
      )}
    </main>
  );
}

function TodoRow({
  todo,
  editing,
  draft,
  setDraft,
  onToggle,
  onDelete,
  onEdit,
  onSave,
  onCancel,
}: {
  todo: Todo;
  editing: boolean;
  draft: string;
  setDraft: (v: string) => void;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  if (editing) {
    return (
      <form
        className='flex items-center gap-3 rounded-xl bg-fill px-2 py-2'
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onCancel();
          }}
          autoFocus
          aria-label='Edit task'
          className='h-9 flex-1 rounded-lg text-sm'
        />
        <Button type='submit' size='sm' aria-label='Save'>
          Save
        </Button>
        <Button type='button' variant='ghost' size='icon' className='size-8' onClick={onCancel} aria-label='Cancel'>
          <XIcon className='size-4' />
        </Button>
      </form>
    );
  }

  return (
    <div className='group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-fill/60'>
      <Checkbox checked={todo.done} onCheckedChange={onToggle} id={`todo-${todo.id}`} />
      <label
        htmlFor={`todo-${todo.id}`}
        className={`flex-1 cursor-pointer truncate text-[15px] leading-snug transition-colors ${
          todo.done ? 'text-muted-foreground line-through' : ''
        }`}
      >
        {todo.text}
      </label>
      <div className='flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100'>
        <Button
          variant='ghost'
          size='icon'
          className='size-7 text-muted-foreground'
          onClick={onEdit}
          aria-label={`Edit ${todo.text}`}
        >
          <PencilIcon className='size-3.5' />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='size-7 text-muted-foreground hover:text-destructive'
          onClick={onDelete}
          aria-label={`Delete ${todo.text}`}
        >
          <Trash2Icon className='size-3.5' />
        </Button>
      </div>
    </div>
  );
}