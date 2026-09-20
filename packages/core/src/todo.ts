export interface Todo {
  id: number;
  text: string;
  done: boolean;
}

let lastId = 0;

export function createTodo(text: string): Todo {
  // Two todos created inside one millisecond must not share an id: React keys and every
  // toggle/remove lookup address a todo by id. Staying strictly increasing also survives a
  // system clock that moves backwards.
  lastId = Math.max(Date.now(), lastId + 1);
  return { id: lastId, text, done: false };
}

/**
 * Advances the id sequence past ids an earlier session already persisted, so a restart — or a
 * clock that moved backwards — cannot hand out an id that is already in use.
 */
export function reserveTodoIds(todos: readonly Todo[]): void {
  for (const todo of todos) {
    if (Number.isFinite(todo.id)) lastId = Math.max(lastId, todo.id);
  }
}

/**
 * Minimal persistence contract every platform implements behind the same
 * shape, so all state logic above it stays platform-independent.
 */
export interface TodoStore {
  load(): Promise<Todo[]>;
  save(todos: Todo[]): Promise<void>;
}
