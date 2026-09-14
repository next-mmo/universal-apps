const list = document.querySelector('#todos');
const errorBox = document.querySelector('#error');
const status = document.querySelector('#status');
const retry = document.querySelector('#retry');
const addForm = document.querySelector('#add-form');
const titleInput = document.querySelector('#new-title');
let todos = [];
let filter = 'all';
let busy = false;
let editId = null;

async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed. Please retry.');
  return data;
}
function error(message) { errorBox.textContent = message; errorBox.hidden = false; }
function setBusy(value) {
  busy = value;
  document.querySelectorAll('button, input').forEach(element => { element.disabled = value; });
  list.setAttribute('aria-busy', String(value));
}
function button(label, action, className = '') {
  const element = document.createElement('button');
  element.type = 'button'; element.textContent = label; element.className = className;
  element.addEventListener('click', action); return element;
}
async function mutate(action, message, focus) {
  if (busy) return;
  setBusy(true); errorBox.hidden = true; status.textContent = '';
  try { await action(); editId = null; render(); status.textContent = message; }
  catch (err) { error(err.message || 'Network error. Please retry.'); }
  finally { setBusy(false); focus?.(); }
}
function render() {
  list.replaceChildren();
  const active = todos.filter(todo => !todo.completed).length;
  document.querySelector('#count').textContent = `${active} active · ${todos.length} total`;
  const visible = todos.filter(todo => filter === 'all' || (filter === 'active' ? !todo.completed : todo.completed));
  document.querySelector('#empty').hidden = visible.length > 0;
  for (const todo of visible) {
    const item = document.createElement('li'); item.className = `todo${todo.completed ? ' done' : ''}`; item.dataset.id = todo.id;
    if (editId === todo.id) {
      const form = document.createElement('form'); form.className = 'edit-form';
      const input = document.createElement('input'); input.value = todo.title; input.maxLength = 200; input.required = true; input.setAttribute('aria-label', 'Edit task title');
      const save = document.createElement('button'); save.type = 'submit'; save.textContent = 'Save';
      form.append(input, save, button('Cancel', () => { editId = null; render(); }));
      form.addEventListener('submit', event => {
        event.preventDefault();
        if (!input.value.trim()) { error('Title must contain 1–200 characters.'); return; }
        mutate(async () => {
          const { todo: updated } = await api(`/api/todos/${todo.id}`, { method: 'PATCH', body: JSON.stringify({ title: input.value.trim() }) });
          todos = todos.map(entry => entry.id === updated.id ? updated : entry);
        }, 'Task updated.', () => titleInput.focus());
      });
      item.append(form); list.append(item); queueMicrotask(() => input.focus()); continue;
    }
    const toggle = document.createElement('input'); toggle.type = 'checkbox'; toggle.checked = todo.completed; toggle.setAttribute('aria-label', `Complete ${todo.title}`);
    toggle.addEventListener('change', () => {
      const completed = toggle.checked;
      mutate(async () => {
        try {
          const { todo: updated } = await api(`/api/todos/${todo.id}`, { method: 'PATCH', body: JSON.stringify({ completed }) });
          todos = todos.map(entry => entry.id === updated.id ? updated : entry);
        } catch (err) { toggle.checked = todo.completed; throw err; }
      }, completed ? 'Task completed.' : 'Task reopened.', () => titleInput.focus());
    });
    const text = document.createElement('span'); text.className = 'title'; text.textContent = todo.title;
    const actions = document.createElement('div'); actions.className = 'actions';
    actions.append(button('Edit', () => { editId = todo.id; render(); }), button('Delete', () => {
      mutate(async () => { await api(`/api/todos/${todo.id}`, { method: 'DELETE' }); todos = todos.filter(entry => entry.id !== todo.id); }, 'Task deleted.', () => titleInput.focus());
    }, 'danger'));
    item.append(toggle, text, actions); list.append(item);
  }
}
async function load() {
  if (busy) return;
  setBusy(true); errorBox.hidden = true; retry.hidden = true;
  try { ({ todos } = await api('/api/todos')); render(); status.textContent = 'Ready. Changes save locally.'; }
  catch (err) { error(err.message || 'Could not load tasks.'); retry.hidden = false; }
  finally { setBusy(false); }
}
addForm.addEventListener('submit', event => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) { error('Title must contain 1–200 characters.'); return; }
  mutate(async () => { const { todo } = await api('/api/todos', { method: 'POST', body: JSON.stringify({ title }) }); todos.push(todo); titleInput.value = ''; }, 'Task added.', () => titleInput.focus());
});
for (const control of document.querySelectorAll('[data-filter]')) {
  control.addEventListener('click', () => {
    filter = control.dataset.filter; editId = null;
    document.querySelectorAll('[data-filter]').forEach(element => element.setAttribute('aria-pressed', String(element === control)));
    render();
  });
}
retry.addEventListener('click', load);
load();
