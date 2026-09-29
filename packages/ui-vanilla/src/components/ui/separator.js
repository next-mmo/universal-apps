import {
  clear,
  defineUniversalElement,
  text,
} from '../../lib/component.js';

export const UniversalSeparator = defineUniversalElement(
  'universal-separator',
  (host) => {
    const node = document.createElement('hr');
    node.className = 'u-separator';
    if (text(host, 'orientation', 'horizontal') === 'vertical') {
      node.dataset.orientation = 'vertical';
    }
    clear(host, node);
  },
);
