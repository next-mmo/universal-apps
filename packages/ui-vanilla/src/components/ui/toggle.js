import {
  bool,
  clear,
  defineUniversalElement,
  emit,
  makeButton,
  reflectAttribute,
  text,
} from '../../lib/component.js';

export const UniversalToggle = defineUniversalElement(
  'universal-toggle',
  (host, { initialText }) => {
    const node = makeButton(text(host, 'label', initialText || 'Toggle'));
    const update = () =>
      node.setAttribute('aria-pressed', String(bool(host, 'pressed')));

    node.addEventListener('click', () => {
      reflectAttribute(host, 'pressed', !bool(host, 'pressed'));
      update();
      emit(host, 'change', { pressed: bool(host, 'pressed') });
    });

    update();
    clear(host, node);
  },
);
