import {
  clear,
  defineUniversalElement,
  makeButton,
  text,
} from '../../lib/component.js';

export const UniversalTooltip = defineUniversalElement(
  'universal-tooltip',
  (host, { initialText }) => {
    const wrap = document.createElement('span');
    wrap.className = 'u-tooltip';

    const trigger = makeButton(
      text(host, 'trigger-text', initialText || 'Info'),
    );

    const tip = document.createElement('span');
    tip.className = 'u-tooltip-content';
    tip.setAttribute('role', 'tooltip');
    tip.textContent = text(host, 'content', 'Helpful information');

    wrap.append(trigger, tip);
    clear(host, wrap);
  },
);
