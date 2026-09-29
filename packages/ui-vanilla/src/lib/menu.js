import {
  clear,
  emit,
  list,
  makeButton,
  option,
  text,
} from './component.js';

export function renderMenu(host, popover = false) {
  const details = document.createElement('details');
  details.className = popover ? 'u-popover' : 'u-menu';

  const summary = document.createElement('summary');
  summary.className = 'u-button';
  summary.textContent = text(
    host,
    'trigger-text',
    popover ? 'Open popover' : 'Open menu',
  );
  details.append(summary);

  if (popover) {
    const content = document.createElement('div');
    content.className = 'u-popover-content';
    content.textContent = text(host, 'content', 'Popover content');
    details.append(content);
  } else {
    const menu = document.createElement('div');
    menu.className = 'u-menu-content';
    menu.setAttribute('role', 'menu');
    for (const item of list(
      host.getAttribute('items'),
      ['Profile', 'Settings', 'Sign out'],
    )) {
      const parsed = option(item, 0);
      const row = makeButton(parsed.label, 'u-menu-item');
      row.setAttribute('role', 'menuitem');
      row.addEventListener('click', () => {
        details.open = false;
        emit(host, 'select', { value: parsed.value });
      });
      menu.append(row);
    }
    details.append(menu);
  }

  clear(host, details);
}
