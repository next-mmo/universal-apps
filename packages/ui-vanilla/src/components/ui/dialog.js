import { defineUniversalElement } from '../../lib/component.js';
import { renderOverlay } from '../../lib/overlay.js';

export const UniversalDialog = defineUniversalElement(
  'universal-dialog',
  (host) => renderOverlay(host, 'dialog'),
);
