import {
  clear,
  defineUniversalElement,
  emit,
  text,
} from '../../lib/component.js';

export const UniversalDateRangePicker = defineUniversalElement(
  'universal-date-range-picker',
  (host) => {
    const wrap = document.createElement('div');
    wrap.className = 'u-date-range';

    const start = document.createElement('input');
    const end = document.createElement('input');
    start.type = 'date';
    end.type = 'date';
    start.className = 'u-input';
    end.className = 'u-input';
    start.value = text(host, 'start');
    end.value = text(host, 'end');
    start.setAttribute(
      'aria-label',
      text(host, 'start-label', 'Start date'),
    );
    end.setAttribute(
      'aria-label',
      text(host, 'end-label', 'End date'),
    );

    const change = () => {
      host.setAttribute('start', start.value);
      host.setAttribute('end', end.value);
      emit(host, 'change', {
        start: start.value,
        end: end.value,
      });
    };

    start.addEventListener('change', change);
    end.addEventListener('change', change);
    wrap.append(start, end);
    clear(host, wrap);
  },
);
