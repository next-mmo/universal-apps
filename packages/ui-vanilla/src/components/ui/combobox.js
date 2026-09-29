import { defineUniversalElement } from '../../lib/component.js';
import { renderCommand } from '../../lib/command.js';

export const UniversalCombobox = defineUniversalElement(
  'universal-combobox',
  (host) => renderCommand(host, true),
);
