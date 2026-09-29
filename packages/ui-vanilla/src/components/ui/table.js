import {
  clear,
  defineUniversalElement,
  list,
} from '../../lib/component.js';

export const UniversalTable = defineUniversalElement(
  'universal-table',
  (host) => {
    const headers = list(
      host.getAttribute('headers'),
      ['Name', 'Value'],
    ).map(String);
    const rows = list(
      host.getAttribute('rows'),
      [['Example', 'Ready']],
    );

    const table = document.createElement('table');
    table.className = 'u-table';

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    for (const value of headers) {
      const cell = document.createElement('th');
      cell.scope = 'col';
      cell.textContent = value;
      headRow.append(cell);
    }
    thead.append(headRow);

    const tbody = document.createElement('tbody');
    for (const row of rows) {
      const tr = document.createElement('tr');
      const values = Array.isArray(row)
        ? row
        : Object.values(row ?? {});
      for (const value of values) {
        const cell = document.createElement('td');
        cell.textContent = String(value ?? '');
        tr.append(cell);
      }
      tbody.append(tr);
    }

    table.append(thead, tbody);
    clear(host, table);
  },
);
