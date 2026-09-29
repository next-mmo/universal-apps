import {
  clear,
  defineUniversalElement,
  emit,
  fieldAttributes,
  reflectAttribute,
  text,
} from '../../lib/component.js';

export const UniversalTextarea = defineUniversalElement(
  'universal-textarea',
  (host) => {
    const node = document.createElement('textarea');
    node.className = 'u-input u-textarea';
    node.value = text(host, 'value');
    node.rows = Number(text(host, 'rows', '4')) || 4;
    fieldAttributes(host, node);
    node.addEventListener('input', (event) => {
      event.stopPropagation();
      reflectAttribute(host, 'value', node.value);
      emit(host, 'input', { value: node.value });
    });
    clear(host, node);
  },
);
