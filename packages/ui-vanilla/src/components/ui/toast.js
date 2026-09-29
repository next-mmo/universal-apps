import {
  bool,
  clear,
  defineUniversalElement,
  emit,
  makeButton,
  text,
} from '../../lib/component.js';

export const UniversalToast = defineUniversalElement(
  'universal-toast',
  (host, { initialText }) => {
    const node = document.createElement('div');
    node.className = 'u-toast';
    node.setAttribute('role', 'status');
    node.hidden = !bool(host, 'open') && !host.hasAttribute('content');

    const title = document.createElement('strong');
    title.textContent = text(host, 'title', 'Notification');

    const content = document.createElement('span');
    content.textContent = text(host, 'content', initialText);

    const close = makeButton('Dismiss', 'u-button u-button--ghost');
    close.addEventListener('click', () => {
      host.removeAttribute('open');
      node.hidden = true;
      emit(host, 'close', {});
    });

    node.append(title, content, close);
    clear(host, node);
  },
  {
    methods: {
      show(message) {
        this.setAttribute('content', String(message ?? ''));
        this.setAttribute('open', '');
        this.render();
      },
    },
  },
);
