import { useState } from 'react';
import type { TodoStore } from '@package/core/src/todo';
import { useTodos } from '@package/core/src/use-todos';

const inputClassName =
  'w-full min-w-0 rounded-lg border border-transparent bg-[#f6f6f6] px-[1.2em] py-[0.6em] font-[inherit] text-[1em] font-medium text-[#0f0f0f] outline-none transition-[border-color] duration-[250ms] focus:border-[#396cd8] dark:bg-[#0f0f0f98] dark:text-white';

const buttonClassName =
  'cursor-pointer rounded-lg border border-transparent bg-white px-[1.6em] py-[0.6em] font-[inherit] text-[1em] font-medium text-[#0f0f0f] shadow-[0_2px_2px_rgba(0,0,0,0.2)] outline-none transition-[border-color] duration-[250ms] hover:border-[#396cd8] active:border-[#396cd8] active:bg-[#e8e8e8] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#0f0f0f98] dark:text-white dark:active:bg-[#0f0f0f69]';

export function TodoApp({ store }: { store: TodoStore }) {
  const { todos, loaded, addTodo, toggleTodo, removeTodo, clearDone } = useTodos(store);
  const [draft, setDraft] = useState('');

  const remaining = todos.filter((todo) => !todo.done).length;
  const doneCount = todos.length - remaining;

  return (
    <section className='w-full max-w-xl rounded-xl bg-white p-6 text-left shadow-[0_2px_12px_rgba(0,0,0,0.08)] dark:bg-[#0f0f0f98]'>
      <h2 className='mb-4 text-xl font-semibold'>Todos</h2>

      <form
        className='flex gap-3'
        onSubmit={(event) => {
          event.preventDefault();
          addTodo(draft);
          setDraft('');
        }}
      >
        <input
          className={inputClassName}
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
          placeholder='What needs doing?'
          aria-label='New todo'
        />
        <button type='submit' className={buttonClassName}>
          Add
        </button>
      </form>

      {loaded && todos.length === 0 && (
        <p className='mt-6 text-center opacity-60'>
          Nothing here yet — add your first task above.
        </p>
      )}

      {todos.length > 0 && (
        <ul className='mt-4 flex flex-col gap-2'>
          {todos.map((todo) => (
            <li
              key={todo.id}
              className='flex items-center gap-3 rounded-lg border border-black/5 px-3 py-2 dark:border-white/10'
            >
              <input
                type='checkbox'
                className='h-4 w-4 accent-[#646cff]'
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
                aria-label={`Mark "${todo.text}" ${todo.done ? 'not done' : 'done'}`}
              />
              <span className={`flex-1 ${todo.done ? 'line-through opacity-50' : ''}`}>
                {todo.text}
              </span>
              <button
                type='button'
                className='cursor-pointer border-none bg-transparent px-1 text-lg leading-none opacity-40 hover:opacity-100'
                onClick={() => removeTodo(todo.id)}
                aria-label={`Delete "${todo.text}"`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {todos.length > 0 && (
        <footer className='mt-4 flex items-center justify-between text-sm opacity-70'>
          <span>
            {remaining} left · {doneCount} done
          </span>
          <button
            type='button'
            className='cursor-pointer border-none bg-transparent p-0 font-medium underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-40'
            onClick={clearDone}
            disabled={doneCount === 0}
          >
            Clear completed
          </button>
        </footer>
      )}
    </section>
  );
}
