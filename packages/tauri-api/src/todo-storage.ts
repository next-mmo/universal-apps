import type { Todo, TodoStore } from '@package/core/todo';
import { invoke } from '@tauri-apps/api/core';
import { isTauri } from './is-tauri';

const STORAGE_KEY = 'todos';

class LocalStorageTodoStore implements TodoStore {
  async load(): Promise<Todo[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? (parsed as Todo[]) : [];
    } catch (error) {
      console.error('Invalid todo cache, starting fresh:', error);
      return [];
    }
  }

  async save(todos: Todo[]): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }
}

class TauriTodoStore implements TodoStore {
  async load(): Promise<Todo[]> {
    return invoke<Todo[]>('load_todos');
  }

  async save(todos: Todo[]): Promise<void> {
    await invoke('save_todos', { todos });
  }
}

let cached: TodoStore | undefined;

/** Picks the right adapter for the current runtime. */
export function getTodoStore(): TodoStore {
  cached ??= isTauri() ? new TauriTodoStore() : new LocalStorageTodoStore();
  return cached;
}
