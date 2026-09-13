import assert from 'node:assert/strict';
import { selectTodos, validateTodoText, type Todo } from './domain';

const rows: Todo[] = [
  { id: 1, text: 'Ship report', done: false, createdAt: 1 },
  { id: 2, text: 'Review PR', done: true, createdAt: 2 },
];
assert.equal(validateTodoText('   '), 'Task text is required');
assert.equal(validateTodoText(' Ship report '), undefined);
assert.deepEqual(selectTodos(rows, 'active', 'ship').map((row) => row.id), [1]);
assert.deepEqual(selectTodos(rows, 'done', '').map((row) => row.id), [2]);
console.log('domain acceptance: 4 assertions passed');
