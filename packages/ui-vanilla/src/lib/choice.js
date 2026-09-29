import { bool, clear, emit, text } from './component.js';

export function renderChoice(host, kind) {
  const wrapper = document.createElement('label');
  wrapper.className = 'u-choice';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = bool(host, 'checked');
  input.disabled = bool(host, 'disabled');
  input.name = text(host, 'name');
  if (kind === 'switch') input.setAttribute('role', 'switch');

  const caption = document.createElement('span');
  caption.textContent = text(
    host,
    'label',
    kind === 'switch' ? 'Toggle' : 'Option',
  );

  input.addEventListener('change', (event) => {
    event.stopPropagation();
    host.toggleAttribute('checked', input.checked);
    emit(host, 'change', { checked: input.checked });
  });

  wrapper.append(input, caption);
  clear(host, wrapper);
}
