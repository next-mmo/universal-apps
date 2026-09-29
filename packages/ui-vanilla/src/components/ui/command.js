import { defineUniversalElement } from '../../lib/component.js';
import { renderCommand } from '../../lib/command.js';

export const UniversalCommand = defineUniversalElement(
  'universal-command',
  (host) => renderCommand(host, false),
);
