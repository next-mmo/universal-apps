import { useState, type FormEvent } from 'react';
import { selectTodos, useBenchmarkTodos, validateTodoText } from './model';
import type { Todo } from './domain';

const FILTERS = ['all', 'active', 'done'] as const;
type Filter = (typeof FILTERS)[number];

export function App() {
  const { todos, ready, error, clearError, add, update, toggle, remove, clearDone } = useBenchmarkTodos();
  const [draft, setDraft] = useState('');
  const [draftError, setDraftError] = useState<string>();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingError, setEditingError] = useState<string>();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const visible = selectTodos(todos, filter, search);

  function handleCreate(event: FormEvent) {
    event.preventDefault();
    const invalid = validateTodoText(draft);
    if (invalid) {
      setDraftError(invalid);
      return;
    }
    setDraftError(undefined);
    void add(draft);
    setDraft('');
  }

  function startEditing(todo: Todo) {
    setEditingId(todo.id);
    setEditingText(todo.text);
    setEditingError(undefined);
  }

  function handleSaveEdit(event: FormEvent, id: number) {
    event.preventDefault();
    const invalid = validateTodoText(editingText);
    if (invalid) {
      setEditingError(invalid);
      return;
    }
    setEditingError(undefined);
    void update(id, editingText);
    setEditingId(null);
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <p className="text-sm text-slate-500">Create, edit, filter and persist your task list.</p>
      </header>

      {ready ? null : (
        <p aria-busy="true" className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
          Loading tasks…
        </p>
      )}

      {error ? (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button type="button" onClick={clearError} className="rounded-md border border-red-300 px-2 py-1 text-xs font-medium">
            Dismiss
          </button>
        </div>
      ) : null}

      <form onSubmit={handleCreate} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4">
        <label htmlFor="new-task" className="text-sm font-medium">
          New task
        </label>
        <div className="flex gap-2">
          <input
            id="new-task"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="What needs doing?"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            Add
          </button>
        </div>
        {draftError ? <p className="text-sm text-red-600">{draftError}</p> : null}
      </form>

      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <label htmlFor="search" className="text-sm font-medium">
          Search
        </label>
        <input
          id="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Filter by text"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <div className="flex gap-2" role="group" aria-label="Filter tasks">
          {FILTERS.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={filter === name}
              onClick={() => setFilter(name)}
              className={
                filter === name
                  ? 'rounded-md bg-slate-900 px-3 py-1 text-sm font-medium capitalize text-white'
                  : 'rounded-md border border-slate-300 px-3 py-1 text-sm font-medium capitalize'
              }
            >
              {name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => void clearDone()}
            className="ml-auto rounded-md border border-slate-300 px-3 py-1 text-sm font-medium"
          >
            Clear done
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
          {todos.length === 0 ? 'No tasks yet. Add your first task above.' : 'No tasks match the current search and filter.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((todo) => (
            <li key={todo.id} className="rounded-lg border border-slate-200 bg-white p-3">
              {editingId === todo.id ? (
                <form onSubmit={(event) => handleSaveEdit(event, todo.id)} className="flex flex-col gap-2">
                  <input
                    aria-label={`Edit ${todo.text}`}
                    value={editingText}
                    onChange={(event) => setEditingText(event.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="rounded-md bg-slate-900 px-3 py-1 text-sm font-medium text-white">
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditingId(null); setEditingError(undefined); }}
                      className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                  {editingError ? <p className="text-sm text-red-600">{editingError}</p> : null}
                </form>
              ) : (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`todo-${todo.id}`}
                    checked={todo.done}
                    onChange={() => void toggle(todo.id)}
                    className="size-4"
                  />
                  <label
                    htmlFor={`todo-${todo.id}`}
                    className={todo.done ? 'flex-1 text-sm text-slate-400 line-through' : 'flex-1 text-sm'}
                  >
                    {todo.text}
                  </label>
                  <button
                    type="button"
                    onClick={() => startEditing(todo)}
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(todo.id)}
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-red-600"
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
