import {
  clear,
  emit,
  fieldAttributes,
  reflectAttribute,
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
    reflectAttribute(host, 'value', node.value);
    emit(host, 'change', { value: node.value });
  });
  clear(host, node);
}
