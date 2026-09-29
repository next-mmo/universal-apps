import { defineUniversalElement } from '../../lib/component.js';
import { renderTabs } from '../../lib/tabs.js';

export const UniversalAnimatedTabs = defineUniversalElement(
  'universal-animated-tabs',
  (host) => renderTabs(host, true),
);
