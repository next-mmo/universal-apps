import {
  bool,
  clear,
  defineUniversalElement,
  list,
  option,
} from '../../lib/component.js';

export const UniversalAccordion = defineUniversalElement(
  'universal-accordion',
  (host) => {
    const wrap = document.createElement('div');
    wrap.className = 'u-accordion';

    list(host.getAttribute('items'), [
      { label: 'Section one', content: 'Section content' },
    ])
      .map(option)
      .forEach((entry, index) => {
        const details = document.createElement('details');
        details.open = index === 0 && bool(host, 'open');

        const summary = document.createElement('summary');
        summary.textContent = entry.label;

        const content = document.createElement('div');
        content.className = 'u-accordion-content';
        content.textContent = entry.content;

        details.append(summary, content);
        wrap.append(details);
      });

    clear(host, wrap);
  },
);
