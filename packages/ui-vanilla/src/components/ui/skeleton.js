import {
  clear,
  defineUniversalElement,
  text,
} from '../../lib/component.js';

export const UniversalSkeleton = defineUniversalElement(
  'universal-skeleton',
  (host) => {
    const node = document.createElement('div');
    node.className = 'u-skeleton';
    node.setAttribute('aria-hidden', 'true');
    node.style.width = text(host, 'width', '100%');
    node.style.height = text(host, 'height', '1rem');
    clear(host, node);
  },
);
