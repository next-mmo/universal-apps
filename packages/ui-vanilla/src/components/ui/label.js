import {
  clear,
  defineUniversalElement,
  text,
} from '../../lib/component.js';

export const UniversalLabel = defineUniversalElement(
  'universal-label',
  (host, { initialText }) => {
    const node = document.createElement('label');
    node.className = 'u-label';
    if (host.hasAttribute('for')) node.htmlFor = host.getAttribute('for');
    node.textContent = text(host, 'label', initialText || 'Label');
    clear(host, node);
  },
);
