import { defineUniversalElement } from '../../lib/component.js';
import { renderTabs } from '../../lib/tabs.js';

export const UniversalTabs = defineUniversalElement(
  'universal-tabs',
  (host) => renderTabs(host, false),
);
