import {
  defineUniversalElement,
  text,
} from '../../lib/component.js';

export const UniversalBadge = defineUniversalElement(
  'universal-badge',
  (host, { initialText }) => {
    host.classList.add('u-badge');
    host.dataset.variant = text(host, 'variant', 'default');
    host.textContent = text(host, 'label', initialText || 'Badge');
  },
);
