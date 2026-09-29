import {
  bool,
  clear,
  defineUniversalElement,
  emit,
  list,
  makeButton,
  option,
  text,
} from '../../lib/component.js';

export const UniversalToggleGroup = defineUniversalElement(
  'universal-toggle-group',
  (host) => {
    const wrap = document.createElement('div');
    wrap.className = 'u-toggle-group';

    const multiple = bool(host, 'multiple');
    const selected = new Set(
      text(host, 'value').split(',').filter(Boolean),
    );

    list(host.getAttribute('options'), ['One', 'Two', 'Three'])
      .map(option)
      .forEach((entry) => {
        const node = makeButton(entry.label);
        node.dataset.value = entry.value;
        node.setAttribute(
          'aria-pressed',
          String(selected.has(entry.value)),
        );

        node.addEventListener('click', () => {
          if (!multiple) selected.clear();
          if (selected.has(entry.value)) selected.delete(entry.value);
          else selected.add(entry.value);

          host.setAttribute('value', [...selected].join(','));
          for (const child of wrap.children) {
            child.setAttribute(
              'aria-pressed',
              String(selected.has(child.dataset.value)),
            );
          }
          emit(host, 'change', { value: [...selected] });
        });

        wrap.append(node);
      });

    clear(host, wrap);
  },
);
