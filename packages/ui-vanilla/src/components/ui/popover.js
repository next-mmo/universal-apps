import { defineUniversalElement } from '../../lib/component.js';
import { renderMenu } from '../../lib/menu.js';

export const UniversalPopover = defineUniversalElement(
  'universal-popover',
  (host) => renderMenu(host, true),
);
