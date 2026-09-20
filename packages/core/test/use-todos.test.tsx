// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Todo, TodoStore } from '../src/todo.ts';
import { useTodos } from '../src/use-todos.ts';

const createStore = (initial: Todo[] = []) => {
  const saved: Todo[][] = [];
  const store: TodoStore = {
    load: vi.fn<TodoStore['load']>(async () => initial),
    save: vi.fn<TodoStore['save']>(async (todos) => {
      saved.push(todos);
    }),
  };
  return { store, saved };
};

const todo = (id: number, text: string, done = false): Todo => ({ id, text, done });

describe('useTodos', () => {
  it('starts empty and unloaded, then publishes what the store returned', async () => {
    const { store } = createStore([todo(1, 'from disk')]);
    const { result } = renderHook(() => useTodos(store));

    expect(result.current.loaded).toBe(false);
    expect(result.current.todos).toEqual([]);

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });
    expect(result.current.todos).toEqual([todo(1, 'from disk')]);
  });

  it('adds a trimmed todo and persists the next list', async () => {
    const { store, saved } = createStore();
    const { result } = renderHook(() => useTodos(store));
    await waitFor(() => expect(result.current.loaded).toBe(true));

    act(() => result.current.addTodo('  buy milk  '));

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0]!.text).toBe('buy milk');
    expect(result.current.todos[0]!.done).toBe(false);
    expect(saved.at(-1)).toEqual(result.current.todos);
  });

  it('ignores an empty or whitespace-only addition', async () => {
    const { store, saved } = createStore();
    const { result } = renderHook(() => useTodos(store));
    await waitFor(() => expect(result.current.loaded).toBe(true));

    act(() => result.current.addTodo('   '));
    act(() => result.current.addTodo(''));

    expect(result.current.todos).toEqual([]);
    expect(saved).toHaveLength(0);
  });

  it('toggles only the addressed todo', async () => {
    const { store } = createStore([todo(1, 'a'), todo(2, 'b')]);
    const { result } = renderHook(() => useTodos(store));
    await waitFor(() => expect(result.current.loaded).toBe(true));

    act(() => result.current.toggleTodo(2));

    expect(result.current.todos).toEqual([todo(1, 'a'), todo(2, 'b', true)]);
  });

  it('updates text and done together', async () => {
    const { store } = createStore([todo(1, 'a')]);
    const { result } = renderHook(() => useTodos(store));
    await waitFor(() => expect(result.current.loaded).toBe(true));

    act(() => result.current.updateTodo(1, { text: 'renamed', done: true }));

    expect(result.current.todos[0]).toEqual(todo(1, 'renamed', true));
  });

  it('rejects an update that would blank the text', async () => {
    const { store } = createStore([todo(1, 'a')]);
    const { result } = renderHook(() => useTodos(store));
    await waitFor(() => expect(result.current.loaded).toBe(true));

    act(() => result.current.updateTodo(1, { text: '   ' }));

    expect(result.current.todos[0]!.text).toBe('a');
  });

  it('removes one todo and clears the completed ones', async () => {
    const { store } = createStore([todo(1, 'a'), todo(2, 'b', true), todo(3, 'c')]);
    const { result } = renderHook(() => useTodos(store));
    await waitFor(() => expect(result.current.loaded).toBe(true));

    act(() => result.current.removeTodo(1));
    expect(result.current.todos.map((item) => item.id)).toEqual([2, 3]);

    act(() => result.current.clearDone());
    expect(result.current.todos.map((item) => item.id)).toEqual([3]);
  });

  it('still reports loaded when the store fails to load', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const store: TodoStore = {
      load: vi.fn<TodoStore['load']>(async () => {
        throw new Error('offline');
      }),
      save: vi.fn<TodoStore['save']>(async () => {}),
    };
    const { result } = renderHook(() => useTodos(store));

    // A failed load must not leave the UI stuck on a spinner forever.
    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.todos).toEqual([]);
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  it('does not reuse an id that the loaded list already occupies', async () => {
    const { store } = createStore([todo(9_999_999_999_999, 'from disk')]);
    const { result } = renderHook(() => useTodos(store));
    await waitFor(() => expect(result.current.loaded).toBe(true));

    act(() => result.current.addTodo('new'));

    const ids = result.current.todos.map((item) => item.id);
    expect(new Set(ids).size).toBe(2);
  });
});
