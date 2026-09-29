import {
  clear,
  emit,
  list,
  makeButton,
  option,
  reflectAttribute,
  text,
} from './component.js';

export function renderCommand(host, combobox = false) {
  const wrap = document.createElement('div');
  wrap.className = 'u-command';

  const input = document.createElement('input');
  input.className = 'u-input';
  input.type = 'search';
  input.placeholder = text(
    host,
    'placeholder',
    combobox ? 'Select an option...' : 'Type a command...',
  );
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');

  const options = list(
    host.getAttribute('options'),
    ['First option', 'Second option', 'Third option'],
  ).map(option);
  const selected = options.find(
    (entry) => entry.value === host.getAttribute('value'),
  );
  if (selected) input.value = selected.label;

  const results = document.createElement('div');
  results.className = 'u-command-list';
  results.setAttribute('role', 'listbox');

  const paint = () => {
    const query = input.value.trim().toLowerCase();
    results.replaceChildren();
    for (const item of options.filter((entry) =>
      entry.label.toLowerCase().includes(query),
    )) {
      const row = makeButton(item.label, 'u-command-item');
      row.setAttribute('role', 'option');
      row.addEventListener('click', () => {
        input.value = item.label;
        reflectAttribute(host, 'value', item.value);
        emit(host, 'change', {
          value: item.value,
          label: item.label,
        });
      });
      results.append(row);
    }
  };

  input.addEventListener('input', paint);
  wrap.append(input, results);
  clear(host, wrap);
  paint();
}
