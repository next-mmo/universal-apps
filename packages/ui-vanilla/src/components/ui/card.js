import {
  clear,
  defineUniversalElement,
  text,
} from '../../lib/component.js';

export const UniversalCard = defineUniversalElement(
  'universal-card',
  (host, { initialText }) => {
    const card = document.createElement('article');
    card.className = 'u-card';

    const title = document.createElement('h3');
    title.textContent = text(host, 'title', 'Card');

    const description = document.createElement('p');
    description.className = 'u-muted';
    description.textContent = text(host, 'description');

    const content = document.createElement('div');
    content.textContent = text(host, 'content', initialText);

    card.append(title, description, content);
    clear(host, card);
  },
);
