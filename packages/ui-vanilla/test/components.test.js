// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

import '../src/components/ui/accordion.js';
import '../src/components/ui/animated-tabs.js';
import '../src/components/ui/avatar.js';
import '../src/components/ui/badge.js';
import '../src/components/ui/button.js';
import '../src/components/ui/calendar.js';
import '../src/components/ui/card.js';
import '../src/components/ui/checkbox.js';
import '../src/components/ui/combobox.js';
import '../src/components/ui/command.js';
import '../src/components/ui/date-picker.js';
import '../src/components/ui/date-range-picker.js';
import '../src/components/ui/dialog.js';
import '../src/components/ui/drawer.js';
import '../src/components/ui/dropdown-menu.js';
import '../src/components/ui/input.js';
import '../src/components/ui/label.js';
import '../src/components/ui/popover.js';
import '../src/components/ui/select.js';
import '../src/components/ui/separator.js';
import '../src/components/ui/skeleton.js';
import '../src/components/ui/switch.js';
import '../src/components/ui/table.js';
import '../src/components/ui/tabs.js';
import '../src/components/ui/textarea.js';
import '../src/components/ui/toast.js';
import '../src/components/ui/toggle-group.js';
import '../src/components/ui/toggle.js';
import '../src/components/ui/tooltip.js';

const tags = [
  'accordion', 'animated-tabs', 'avatar', 'badge', 'button', 'calendar', 'card',
  'checkbox', 'combobox', 'command', 'date-picker', 'date-range-picker',
  'dialog', 'drawer', 'dropdown-menu', 'input', 'label', 'popover', 'select',
  'separator', 'skeleton', 'switch', 'table', 'tabs', 'textarea', 'toast',
  'toggle-group', 'toggle', 'tooltip',
];

const mount = (name, attributes = {}, content = '') => {
  const element = document.createElement('universal-' + name);
  for (const [key, value] of Object.entries(attributes)) {
    if (value === true) element.setAttribute(key, '');
    else if (value !== false && value != null) element.setAttribute(key, String(value));
  }
  if (content) element.textContent = content;
  document.body.append(element);
  return element;
};

beforeEach(() => {
  document.body.replaceChildren();
});

describe('vanilla custom element catalog', () => {
  it('registers every component and keeps rendering in the light DOM', () => {
    for (const name of tags) {
      expect(customElements.get('universal-' + name)).toBeTypeOf('function');
    }

    const configurations = {
      accordion: { items: JSON.stringify([{ label: 'One', content: 'Panel' }]) },
      'animated-tabs': { tabs: JSON.stringify([{ value: 'one', label: 'One', content: 'Panel' }]) },
      avatar: { fallback: 'UA' },
      badge: { label: 'Ready' },
      button: { label: 'Save' },
      calendar: { value: '2026-09-29' },
      card: { title: 'Card', content: 'Body' },
      checkbox: { label: 'Accept' },
      combobox: { options: JSON.stringify(['Alpha', 'Beta']) },
      command: { options: JSON.stringify(['Alpha', 'Beta']) },
      'date-picker': { value: '2026-09-29' },
      'date-range-picker': { start: '2026-09-01', end: '2026-09-29' },
      dialog: { title: 'Dialog', content: 'Body' },
      drawer: { title: 'Drawer', content: 'Body' },
      'dropdown-menu': { items: JSON.stringify(['Profile', 'Settings']) },
      input: { value: 'hello' },
      label: { label: 'Name' },
      popover: { content: 'Popover' },
      select: { options: JSON.stringify(['One', 'Two']), value: 'One' },
      separator: { orientation: 'vertical' },
      skeleton: { width: '8rem', height: '2rem' },
      switch: { label: 'Enabled' },
      table: { headers: JSON.stringify(['Name']), rows: JSON.stringify([['Universal']]) },
      tabs: { tabs: JSON.stringify([{ value: 'one', label: 'One', content: 'Panel' }]) },
      textarea: { value: 'Notes' },
      toast: { title: 'Saved', content: 'Done', open: true },
      'toggle-group': { options: JSON.stringify(['One', 'Two']) },
      toggle: { label: 'Bold' },
      tooltip: { 'trigger-text': 'Info', content: 'Help' },
    };

    for (const name of tags) {
      const element = mount(name, configurations[name] ?? {});
      expect(element.shadowRoot).toBeNull();
      expect(element.childNodes.length).toBeGreaterThan(0);
    }
  });

  it('renders a native button and reacts to host attributes', () => {
    const element = mount('button', { variant: 'outline' }, 'Save');
    const button = element.querySelector('button');

    expect(button?.textContent).toBe('Save');
    expect(button?.dataset.variant).toBe('outline');

    element.setAttribute('disabled', '');
    element.setAttribute('label', 'Saving');
    const updated = element.querySelector('button');
    expect(updated?.disabled).toBe(true);
    expect(updated?.textContent).toBe('Saving');
  });

  it('uses native form controls and emits change details', () => {
    const checkbox = mount('checkbox', { label: 'Accept' });
    const checkboxChange = vi.fn();
    checkbox.addEventListener('change', checkboxChange);
    checkbox.querySelector('input')?.click();

    expect(checkbox.hasAttribute('checked')).toBe(true);
    expect(checkboxChange).toHaveBeenCalledTimes(1);
    expect(checkboxChange.mock.calls[0][0].detail.checked).toBe(true);

    const select = mount('select', {
      options: JSON.stringify([
        { value: 'a', label: 'Alpha' },
        { value: 'b', label: 'Beta' },
      ]),
      value: 'a',
    });
    const selectChange = vi.fn();
    select.addEventListener('change', selectChange);
    const control = select.querySelector('select');
    control.value = 'b';
    control.dispatchEvent(new Event('change', { bubbles: true }));

    expect(select.getAttribute('value')).toBe('b');
    expect(selectChange).toHaveBeenCalledTimes(1);
    expect(selectChange.mock.calls[0][0].detail.value).toBe('b');

    const input = mount('input', { value: 'first' });
    const inputEvent = vi.fn();
    input.addEventListener('input', inputEvent);
    const nativeInput = input.querySelector('input');
    nativeInput.value = 'second';
    nativeInput.dispatchEvent(new Event('input', { bubbles: true }));

    expect(inputEvent).toHaveBeenCalledTimes(1);
    expect(inputEvent.mock.calls[0][0].detail.value).toBe('second');
  });

  it('does not emit a tabs change on mount and supports keyboard selection', () => {
    const element = document.createElement('universal-tabs');
    element.setAttribute('tabs', JSON.stringify([
      { value: 'one', label: 'One', content: 'First' },
      { value: 'two', label: 'Two', content: 'Second' },
    ]));
    const changed = vi.fn();
    element.addEventListener('change', changed);
    document.body.append(element);

    expect(changed).not.toHaveBeenCalled();
    expect(element.getAttribute('value')).toBe('one');

    const first = element.querySelector('[role="tab"][data-value="one"]');
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

    expect(element.getAttribute('value')).toBe('two');
    expect(changed).toHaveBeenCalledTimes(1);
    expect(element.querySelector('[role="tab"][data-value="two"]')?.getAttribute('aria-selected')).toBe('true');
  });

  it('keeps date range and sizing attributes reactive', () => {
    const range = mount('date-range-picker', {
      start: '2026-09-01',
      end: '2026-09-10',
    });
    range.setAttribute('end', '2026-09-29');
    const dateInputs = range.querySelectorAll('input[type="date"]');
    expect(dateInputs[1]?.value).toBe('2026-09-29');

    const skeleton = mount('skeleton', { width: '4rem', height: '1rem' });
    skeleton.setAttribute('width', '8rem');
    expect(skeleton.firstElementChild?.style.width).toBe('8rem');
  });

  it('uses native disclosure and dialog primitives for overlays', () => {
    const menu = mount('dropdown-menu', {
      items: JSON.stringify([{ value: 'settings', label: 'Settings' }]),
    });
    expect(menu.querySelector('details')).not.toBeNull();
    expect(menu.querySelector('[role="menu"]')).not.toBeNull();

    const dialog = mount('dialog', { title: 'Confirm', content: 'Continue?' });
    dialog.querySelector('button')?.click();
    expect(dialog.querySelector('dialog')?.hasAttribute('open')).toBe(true);
  });
});
