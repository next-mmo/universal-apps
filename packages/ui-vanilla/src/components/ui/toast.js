import {
  bool,
  clear,
  defineUniversalElement,
  emit,
  makeButton,
  reflectAttribute,
  text,
} from '../../lib/component.js';

export const UniversalToast = defineUniversalElement(
  'universal-toast',
  (host, { initialText }) => {
    const node = document.createElement('div');
    node.className = 'u-toast';
    node.setAttribute('role', 'status');
    node.hidden = !bool(host, 'open');

    const title = document.createElement('strong');
    title.textContent = text(host, 'title', 'Notification');

    const content = document.createElement('span');
    content.textContent = text(host, 'content', initialText);

    const close = makeButton('Dismiss', 'u-button u-button--ghost');
    close.addEventListener('click', () => {
      reflectAttribute(host, 'open', false);
      node.hidden = true;
      emit(host, 'close', {});
    });

    node.append(title, content, close);
    clear(host, node);
  },
  {
    methods: {
      show(message) {
        reflectAttribute(this, 'content', String(message ?? ''));
        reflectAttribute(this, 'open', true);
        this.render();
      },
    },
  },
);
