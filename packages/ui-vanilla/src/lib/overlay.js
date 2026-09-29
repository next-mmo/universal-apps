import { clear, emit, makeButton, text } from './component.js';

export function renderOverlay(host, kind) {
  const trigger = makeButton(
    text(
      host,
      'trigger-text',
      kind === 'drawer' ? 'Open drawer' : 'Open dialog',
    ),
  );

  const dialog = document.createElement('dialog');
  dialog.className = kind === 'drawer' ? 'u-dialog u-drawer' : 'u-dialog';
  if (kind === 'drawer') dialog.dataset.side = text(host, 'side', 'right');

  const title = document.createElement('h2');
  title.textContent = text(
    host,
    'title',
    kind === 'drawer' ? 'Drawer' : 'Dialog',
  );

  const description = document.createElement('p');
  description.className = 'u-muted';
  description.textContent = text(host, 'description');

  const content = document.createElement('div');
  content.className = 'u-dialog-content';
  content.textContent = text(host, 'content');

  const close = makeButton('Close', 'u-button u-button--secondary');
  close.addEventListener('click', () => dialog.close?.());

  dialog.append(title, description, content, close);
  trigger.addEventListener('click', () => {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  });
  dialog.addEventListener('close', () => emit(host, 'close', {}));
  clear(host, trigger, dialog);
}
