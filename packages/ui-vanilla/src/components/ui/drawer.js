import { defineUniversalElement } from '../../lib/component.js';
import { renderOverlay } from '../../lib/overlay.js';

export const UniversalDrawer = defineUniversalElement(
  'universal-drawer',
  (host) => renderOverlay(host, 'drawer'),
);
