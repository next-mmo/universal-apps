import { defineUniversalElement } from '../../lib/component.js';
import { renderChoice } from '../../lib/choice.js';

export const UniversalCheckbox = defineUniversalElement(
  'universal-checkbox',
  (host) => renderChoice(host, 'checkbox'),
);
