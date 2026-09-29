import { defineUniversalElement } from '../../lib/component.js';
import { renderDateInput } from '../../lib/date-input.js';

export const UniversalCalendar = defineUniversalElement(
  'universal-calendar',
  renderDateInput,
);
