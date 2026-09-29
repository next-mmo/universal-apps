import {
  clear,
  emit,
  fieldAttributes,
  text,
} from './component.js';

export function renderDateInput(host) {
  const node = document.createElement('input');
  node.className = 'u-input';
  node.type = 'date';
  node.value = text(host, 'value');
  fieldAttributes(host, node);
  node.addEventListener('change', (event) => {
    event.stopPropagation();
    host.setAttribute('value', node.value);
    emit(host, 'change', { value: node.value });
  });
  clear(host, node);
}
