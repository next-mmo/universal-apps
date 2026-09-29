import {
  bool,
  clear,
  defineUniversalElement,
  makeButton,
  text,
} from '../../lib/component.js';

export const UniversalButton = defineUniversalElement(
  'universal-button',
  (host, { initialText }) => {
    const node = makeButton(text(host, 'label', initialText || 'Button'));
    node.disabled = bool(host, 'disabled');
    node.dataset.variant = text(host, 'variant', 'default');
    node.type = text(host, 'type', 'button');
    clear(host, node);
  },
);
