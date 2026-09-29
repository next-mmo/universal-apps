import { defineUniversalElement } from '../../lib/component.js';
import { renderMenu } from '../../lib/menu.js';

export const UniversalDropdownMenu = defineUniversalElement(
  'universal-dropdown-menu',
  (host) => renderMenu(host, false),
);
