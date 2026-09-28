const ElementBase = globalThis.HTMLElement ?? class {};

const observed = [
  'checked', 'content', 'default-value', 'description', 'disabled', 'fallback',
  'headers', 'items', 'label', 'max', 'min', 'multiple', 'name', 'open',
  'options', 'placeholder', 'pressed', 'rows', 'side', 'src', 'step', 'tabs',
  'title', 'trigger-text', 'type', 'value', 'variant',
];

const bool = (element, name) =>
  element.hasAttribute(name) && element.getAttribute(name) !== 'false';

const text = (element, name, fallback = '') =>
  element.getAttribute(name) ?? fallback;

const parse = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const list = (value, fallback = []) => {
  const parsed = parse(value, fallback);
  return Array.isArray(parsed) ? parsed : fallback;
};

const option = (value, index) =>
  typeof value === 'object' && value !== null
    ? {
        value: String(value.value ?? value.label ?? index),
        label: String(value.label ?? value.value ?? index),
        content: value.content == null ? '' : String(value.content),
      }
    : { value: String(value), label: String(value), content: '' };

const makeButton = (label, className = 'u-button') => {
  const node = document.createElement('button');
  node.type = 'button';
  node.className = className;
  node.textContent = label;
  return node;
};

const emit = (element, name, detail) =>
  element.dispatchEvent(
    new CustomEvent(name, { bubbles: true, composed: true, detail }),
  );

const clear = (element, ...nodes) => element.replaceChildren(...nodes);

const fieldAttributes = (host, control) => {
  for (const name of ['name', 'min', 'max', 'step', 'placeholder']) {
    const value = host.getAttribute(name);
    if (value !== null) control.setAttribute(name, value);
  }
  control.disabled = bool(host, 'disabled');
  if (host.hasAttribute('required')) control.required = true;
};

function renderChoice(host, kind) {
  const wrapper = document.createElement('label');
  wrapper.className = 'u-choice';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = bool(host, 'checked');
  input.disabled = bool(host, 'disabled');
  input.name = text(host, 'name');
  if (kind === 'switch') input.setAttribute('role', 'switch');
  const caption = document.createElement('span');
  caption.textContent = text(host, 'label', kind === 'switch' ? 'Toggle' : 'Option');
  input.addEventListener('change', () => {
    host.toggleAttribute('checked', input.checked);
    emit(host, 'change', { checked: input.checked });
  });
  wrapper.append(input, caption);
  clear(host, wrapper);
}

function renderTabs(host, animated) {
  const tabs = list(host.getAttribute('tabs'), [
    { value: 'tab-1', label: 'First', content: 'First panel' },
    { value: 'tab-2', label: 'Second', content: 'Second panel' },
  ]).map(option);
  const selected = text(host, 'value', text(host, 'default-value', tabs[0]?.value ?? ''));
  const tabList = document.createElement('div');
  tabList.className = animated ? 'u-tabs-list u-tabs-list--animated' : 'u-tabs-list';
  tabList.setAttribute('role', 'tablist');
  const panels = document.createElement('div');
  panels.className = 'u-tabs-panels';

  const activate = (value, focus = false) => {
    host.setAttribute('value', value);
    for (const trigger of tabList.querySelectorAll('[role="tab"]')) {
      const active = trigger.dataset.value === value;
      trigger.setAttribute('aria-selected', String(active));
      trigger.tabIndex = active ? 0 : -1;
      if (active && focus) trigger.focus();
    }
    for (const panel of panels.querySelectorAll('[role="tabpanel"]')) {
      panel.hidden = panel.dataset.value !== value;
    }
    emit(host, 'change', { value });
  };

  tabs.forEach((tab, index) => {
    const trigger = makeButton(tab.label, 'u-tab');
    trigger.dataset.value = tab.value;
    trigger.id = host.localName + '-tab-' + index + '-' + Math.random().toString(36).slice(2, 7);
    trigger.setAttribute('role', 'tab');
    trigger.addEventListener('click', () => activate(tab.value));
    trigger.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const current = tabs.findIndex((item) => item.value === host.getAttribute('value'));
      const next = event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? tabs.length - 1
          : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      activate(tabs[next].value, true);
    });
    tabList.append(trigger);

    const panel = document.createElement('section');
    panel.dataset.value = tab.value;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', trigger.id);
    panel.textContent = tab.content;
    panels.append(panel);
  });

  clear(host, tabList, panels);
  activate(tabs.some((tab) => tab.value === selected) ? selected : tabs[0]?.value ?? '');
}

function renderOverlay(host, kind) {
  const trigger = makeButton(
    text(host, 'trigger-text', kind === 'drawer' ? 'Open drawer' : 'Open dialog'),
  );
  const dialog = document.createElement('dialog');
  dialog.className = kind === 'drawer' ? 'u-dialog u-drawer' : 'u-dialog';
  if (kind === 'drawer') dialog.dataset.side = text(host, 'side', 'right');

  const title = document.createElement('h2');
  title.textContent = text(host, 'title', kind === 'drawer' ? 'Drawer' : 'Dialog');
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

function renderMenu(host, popover = false) {
  const details = document.createElement('details');
  details.className = popover ? 'u-popover' : 'u-menu';
  const summary = document.createElement('summary');
  summary.className = 'u-button';
  summary.textContent = text(host, 'trigger-text', popover ? 'Open popover' : 'Open menu');
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
    for (const item of list(host.getAttribute('items'), ['Profile', 'Settings', 'Sign out'])) {
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

function renderCommand(host, combobox = false) {
  const wrap = document.createElement('div');
  wrap.className = 'u-command';
  const input = document.createElement('input');
  input.className = 'u-input';
  input.type = 'search';
  input.placeholder = text(host, 'placeholder', combobox ? 'Select an option...' : 'Type a command...');
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');

  const options = list(
    host.getAttribute('options'),
    ['First option', 'Second option', 'Third option'],
  ).map(option);
  const results = document.createElement('div');
  results.className = 'u-command-list';
  results.setAttribute('role', 'listbox');

  const paint = () => {
    const query = input.value.trim().toLowerCase();
    results.replaceChildren();
    for (const item of options.filter((entry) => entry.label.toLowerCase().includes(query))) {
      const row = makeButton(item.label, 'u-command-item');
      row.setAttribute('role', 'option');
      row.addEventListener('click', () => {
        input.value = item.label;
        host.setAttribute('value', item.value);
        emit(host, 'change', { value: item.value, label: item.label });
      });
      results.append(row);
    }
  };

  input.addEventListener('input', paint);
  wrap.append(input, results);
  clear(host, wrap);
  paint();
}

function renderTable(host) {
  const headers = list(host.getAttribute('headers'), ['Name', 'Value']).map(String);
  const rows = list(host.getAttribute('rows'), [['Example', 'Ready']]);
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
    const values = Array.isArray(row) ? row : Object.values(row ?? {});
    for (const value of values) {
      const cell = document.createElement('td');
      cell.textContent = String(value ?? '');
      tr.append(cell);
    }
    tbody.append(tr);
  }
  table.append(thead, tbody);
  clear(host, table);
}

function renderDateRange(host) {
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
  start.setAttribute('aria-label', text(host, 'start-label', 'Start date'));
  end.setAttribute('aria-label', text(host, 'end-label', 'End date'));
  const change = () => {
    host.setAttribute('start', start.value);
    host.setAttribute('end', end.value);
    emit(host, 'change', { start: start.value, end: end.value });
  };
  start.addEventListener('change', change);
  end.addEventListener('change', change);
  wrap.append(start, end);
  clear(host, wrap);
}

export function createUniversalElement(kind) {
  return class UniversalElement extends ElementBase {
    static get observedAttributes() {
      return observed;
    }

    connectedCallback() {
      if (this._initialText === undefined) this._initialText = this.textContent?.trim() ?? '';
      this.render();
    }

    attributeChangedCallback() {
      if (this.isConnected && !this._rendering) this.render();
    }

    get value() {
      return this.querySelector('input, textarea, select')?.value ??
        this.getAttribute('value') ??
        '';
    }

    set value(next) {
      this.setAttribute('value', String(next ?? ''));
    }

    show(message) {
      if (kind !== 'toast') return;
      this.setAttribute('content', String(message ?? ''));
      this.setAttribute('open', '');
      this.render();
    }

    render() {
      if (typeof document === 'undefined') return;
      this._rendering = true;
      try {
        switch (kind) {
          case 'button': {
            const node = makeButton(text(this, 'label', this._initialText || 'Button'));
            node.disabled = bool(this, 'disabled');
            node.dataset.variant = text(this, 'variant', 'default');
            node.type = text(this, 'type', 'button');
            clear(this, node);
            break;
          }
          case 'input': {
            const node = document.createElement('input');
            node.className = 'u-input';
            node.type = text(this, 'type', 'text');
            node.value = text(this, 'value');
            fieldAttributes(this, node);
            node.addEventListener('input', () => emit(this, 'input', { value: node.value }));
            node.addEventListener('change', () => emit(this, 'change', { value: node.value }));
            clear(this, node);
            break;
          }
          case 'textarea': {
            const node = document.createElement('textarea');
            node.className = 'u-input u-textarea';
            node.value = text(this, 'value');
            node.rows = Number(text(this, 'rows', '4')) || 4;
            fieldAttributes(this, node);
            node.addEventListener('input', () => emit(this, 'input', { value: node.value }));
            clear(this, node);
            break;
          }
          case 'label': {
            const node = document.createElement('label');
            node.className = 'u-label';
            if (this.hasAttribute('for')) node.htmlFor = this.getAttribute('for');
            node.textContent = text(this, 'label', this._initialText || 'Label');
            clear(this, node);
            break;
          }
          case 'badge':
            this.className = 'u-badge';
            this.dataset.variant = text(this, 'variant', 'default');
            this.textContent = text(this, 'label', this._initialText || 'Badge');
            break;
          case 'card': {
            const card = document.createElement('article');
            card.className = 'u-card';
            const title = document.createElement('h3');
            title.textContent = text(this, 'title', 'Card');
            const description = document.createElement('p');
            description.className = 'u-muted';
            description.textContent = text(this, 'description');
            const content = document.createElement('div');
            content.textContent = text(this, 'content', this._initialText);
            card.append(title, description, content);
            clear(this, card);
            break;
          }
          case 'checkbox':
          case 'switch':
            renderChoice(this, kind);
            break;
          case 'select': {
            const node = document.createElement('select');
            node.className = 'u-input u-select';
            fieldAttributes(this, node);
            const placeholder = this.getAttribute('placeholder');
            if (placeholder) {
              const entry = document.createElement('option');
              entry.value = '';
              entry.textContent = placeholder;
              entry.disabled = true;
              entry.selected = !this.hasAttribute('value');
              node.append(entry);
            }
            list(this.getAttribute('options'), ['First', 'Second'])
              .map(option)
              .forEach((entry) => {
                const item = document.createElement('option');
                item.value = entry.value;
                item.textContent = entry.label;
                item.selected = entry.value === this.getAttribute('value');
                node.append(item);
              });
            node.addEventListener('change', () => {
              this.setAttribute('value', node.value);
              emit(this, 'change', { value: node.value });
            });
            clear(this, node);
            break;
          }
          case 'accordion': {
            const wrap = document.createElement('div');
            wrap.className = 'u-accordion';
            list(this.getAttribute('items'), [
              { label: 'Section one', content: 'Section content' },
            ]).map(option).forEach((entry, index) => {
              const details = document.createElement('details');
              details.open = index === 0 && bool(this, 'open');
              const summary = document.createElement('summary');
              summary.textContent = entry.label;
              const content = document.createElement('div');
              content.className = 'u-accordion-content';
              content.textContent = entry.content;
              details.append(summary, content);
              wrap.append(details);
            });
            clear(this, wrap);
            break;
          }
          case 'tabs':
            renderTabs(this, false);
            break;
          case 'animated-tabs':
            renderTabs(this, true);
            break;
          case 'dialog':
          case 'drawer':
            renderOverlay(this, kind);
            break;
          case 'dropdown-menu':
            renderMenu(this, false);
            break;
          case 'popover':
            renderMenu(this, true);
            break;
          case 'tooltip': {
            const wrap = document.createElement('span');
            wrap.className = 'u-tooltip';
            const trigger = makeButton(text(this, 'trigger-text', this._initialText || 'Info'));
            const tip = document.createElement('span');
            tip.className = 'u-tooltip-content';
            tip.setAttribute('role', 'tooltip');
            tip.textContent = text(this, 'content', 'Helpful information');
            wrap.append(trigger, tip);
            clear(this, wrap);
            break;
          }
          case 'toast': {
            const node = document.createElement('div');
            node.className = 'u-toast';
            node.setAttribute('role', 'status');
            node.hidden = !bool(this, 'open') && !this.hasAttribute('content');
            const title = document.createElement('strong');
            title.textContent = text(this, 'title', 'Notification');
            const content = document.createElement('span');
            content.textContent = text(this, 'content', this._initialText);
            const close = makeButton('Dismiss', 'u-button u-button--ghost');
            close.addEventListener('click', () => {
              this.removeAttribute('open');
              node.hidden = true;
              emit(this, 'close', {});
            });
            node.append(title, content, close);
            clear(this, node);
            break;
          }
          case 'toggle': {
            const node = makeButton(text(this, 'label', this._initialText || 'Toggle'));
            const update = () => node.setAttribute('aria-pressed', String(bool(this, 'pressed')));
            node.addEventListener('click', () => {
              this.toggleAttribute('pressed', !bool(this, 'pressed'));
              update();
              emit(this, 'change', { pressed: bool(this, 'pressed') });
            });
            update();
            clear(this, node);
            break;
          }
          case 'toggle-group': {
            const wrap = document.createElement('div');
            wrap.className = 'u-toggle-group';
            const multiple = bool(this, 'multiple');
            const selected = new Set(text(this, 'value').split(',').filter(Boolean));
            list(this.getAttribute('options'), ['One', 'Two', 'Three'])
              .map(option)
              .forEach((entry) => {
                const node = makeButton(entry.label);
                node.dataset.value = entry.value;
                const paint = () =>
                  node.setAttribute('aria-pressed', String(selected.has(entry.value)));
                node.addEventListener('click', () => {
                  if (!multiple) selected.clear();
                  if (selected.has(entry.value)) selected.delete(entry.value);
                  else selected.add(entry.value);
                  this.setAttribute('value', [...selected].join(','));
                  for (const child of wrap.children) {
                    child.setAttribute(
                      'aria-pressed',
                      String(selected.has(child.dataset.value)),
                    );
                  }
                  emit(this, 'change', { value: [...selected] });
                });
                paint();
                wrap.append(node);
              });
            clear(this, wrap);
            break;
          }
          case 'command':
            renderCommand(this, false);
            break;
          case 'combobox':
            renderCommand(this, true);
            break;
          case 'avatar': {
            const wrap = document.createElement('span');
            wrap.className = 'u-avatar';
            const src = this.getAttribute('src');
            if (src) {
              const image = document.createElement('img');
              image.src = src;
              image.alt = text(this, 'label', '');
              image.addEventListener('error', () => {
                wrap.textContent = text(this, 'fallback', '?');
              });
              wrap.append(image);
            } else {
              wrap.textContent = text(this, 'fallback', '?');
            }
            clear(this, wrap);
            break;
          }
          case 'calendar':
          case 'date-picker': {
            const node = document.createElement('input');
            node.className = 'u-input';
            node.type = 'date';
            node.value = text(this, 'value');
            fieldAttributes(this, node);
            node.addEventListener('change', () => {
              this.setAttribute('value', node.value);
              emit(this, 'change', { value: node.value });
            });
            clear(this, node);
            break;
          }
          case 'date-range-picker':
            renderDateRange(this);
            break;
          case 'table':
            renderTable(this);
            break;
          case 'separator': {
            const node = document.createElement('hr');
            node.className = 'u-separator';
            if (text(this, 'orientation', 'horizontal') === 'vertical') {
              node.dataset.orientation = 'vertical';
            }
            clear(this, node);
            break;
          }
          case 'skeleton': {
            const node = document.createElement('div');
            node.className = 'u-skeleton';
            node.setAttribute('aria-hidden', 'true');
            node.style.width = text(this, 'width', '100%');
            node.style.height = text(this, 'height', '1rem');
            clear(this, node);
            break;
          }
          default:
            this.classList.add('u-component');
        }
      } finally {
        this._rendering = false;
      }
    }
  };
}

export function defineUniversalElement(tagName, kind) {
  const registry = globalThis.customElements;
  const existing = registry?.get(tagName);
  if (existing) return existing;
  const Element = createUniversalElement(kind);
  registry?.define(tagName, Element);
  return Element;
}
