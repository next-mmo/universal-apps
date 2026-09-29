import {
  clear,
  defineUniversalElement,
  emit,
  fieldAttributes,
  text,
} from '../../lib/component.js';

export const UniversalInput = defineUniversalElement(
  'universal-input',
  (host) => {
    const node = document.createElement('input');
    node.className = 'u-input';
    node.type = text(host, 'type', 'text');
    node.value = text(host, 'value');
    fieldAttributes(host, node);
    node.addEventListener('input', (event) => {
      event.stopPropagation();
      emit(host, 'input', { value: node.value });
    });
    node.addEventListener('change', (event) => {
      event.stopPropagation();
      emit(host, 'change', { value: node.value });
    });
    clear(host, node);
  },
);
