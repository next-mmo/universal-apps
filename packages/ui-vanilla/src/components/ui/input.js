import {
  clear,
  defineUniversalElement,
  emit,
  fieldAttributes,
  reflectAttribute,
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
      reflectAttribute(host, 'value', node.value);
      emit(host, 'input', { value: node.value });
    });
    node.addEventListener('change', (event) => {
      event.stopPropagation();
      reflectAttribute(host, 'value', node.value);
      emit(host, 'change', { value: node.value });
    });
    clear(host, node);
  },
);
