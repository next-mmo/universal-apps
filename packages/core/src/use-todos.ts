import { useCallback, useEffect, useState } from 'react';
import type { Todo, TodoStore } from './todo';
import { createTodo } from './todo';

/**
 * All todo state logic lives here so desktop, web, and any future target
 * share it verbatim — only the injected TodoStore differs per platform.
 */
export function useTodos(store: TodoStore) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    store
      .load()
      .then((initial) => {
        if (active) {
          setTodos(initial);
          setLoaded(true);
        }
      })
      .catch((error) => {
        console.error('Failed to load todos:', error);
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [store]);

  const mutate = useCallback(
    (next: Todo[]) => {
      setTodos(next);
      store.save(next).catch((error) => console.error('Failed to save todos:', error));
    },
    [store],
  );

  const addTodo = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      mutate([...todos, createTodo(trimmed)]);
    },
    [mutate, todos],
  );

  const toggleTodo = useCallback(
    (id: number) => {
      mutate(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)));
    },
    [mutate, todos],
  );

  const updateTodo = useCallback(
    (id: number, patch: Partial<Pick<Todo, 'text' | 'done'>>) => {
      const text = patch.text?.trim();
      if (patch.text !== undefined && !text) return;
      mutate(todos.map((todo) => (todo.id === id ? { ...todo, ...patch, ...(text ? { text } : {}) } : todo)));
    },
    [mutate, todos],
  );

  const removeTodo = useCallback(
    (id: number) => {
      mutate(todos.filter((todo) => todo.id !== id));
    },
    [mutate, todos],
  );

  const clearDone = useCallback(() => {
    mutate(todos.filter((todo) => !todo.done));
  }, [mutate, todos]);

  return { todos, loaded, addTodo, toggleTodo, updateTodo, removeTodo, clearDone };
}
