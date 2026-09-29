import {
  clear,
  defineUniversalElement,
  text,
} from '../../lib/component.js';

export const UniversalAvatar = defineUniversalElement(
  'universal-avatar',
  (host) => {
    const wrap = document.createElement('span');
    wrap.className = 'u-avatar';

    const src = host.getAttribute('src');
    if (src) {
      const image = document.createElement('img');
      image.src = src;
      image.alt = text(host, 'label', '');
      image.addEventListener('error', () => {
        wrap.textContent = text(host, 'fallback', '?');
      });
      wrap.append(image);
    } else {
      wrap.textContent = text(host, 'fallback', '?');
    }

    clear(host, wrap);
  },
);
