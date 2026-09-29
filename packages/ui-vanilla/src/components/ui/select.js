import {
  clear,
  defineUniversalElement,
  emit,
  fieldAttributes,
  list,
  option,
  reflectAttribute,
} from '../../lib/component.js';

export const UniversalSelect = defineUniversalElement(
  'universal-select',
  (host) => {
    const node = document.createElement('select');
    node.className = 'u-input u-select';
    fieldAttributes(host, node);

    const placeholder = host.getAttribute('placeholder');
    if (placeholder) {
      const entry = document.createElement('option');
      entry.value = '';
      entry.textContent = placeholder;
      entry.disabled = true;
      entry.selected = !host.hasAttribute('value');
      node.append(entry);
    }

    list(host.getAttribute('options'), ['First', 'Second'])
      .map(option)
      .forEach((entry) => {
        const item = document.createElement('option');
        item.value = entry.value;
        item.textContent = entry.label;
        item.selected = entry.value === host.getAttribute('value');
        node.append(item);
      });

    node.addEventListener('change', (event) => {
      event.stopPropagation();
      reflectAttribute(host, 'value', node.value);
      emit(host, 'change', { value: node.value });
    });
    clear(host, node);
  },
);
