import { defineUniversalElement } from '../../lib/component.js';
import { renderDateInput } from '../../lib/date-input.js';

export const UniversalDatePicker = defineUniversalElement(
  'universal-date-picker',
  renderDateInput,
);
