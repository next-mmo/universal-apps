import {
  clear,
  emit,
  list,
  makeButton,
  option,
  text,
} from './component.js';

export function renderTabs(host, animated) {
  const tabs = list(host.getAttribute('tabs'), [
    { value: 'tab-1', label: 'First', content: 'First panel' },
    { value: 'tab-2', label: 'Second', content: 'Second panel' },
  ]).map(option);
  const selected = text(
    host,
    'value',
    text(host, 'default-value', tabs[0]?.value ?? ''),
  );

  const tabList = document.createElement('div');
  tabList.className = animated
    ? 'u-tabs-list u-tabs-list--animated'
    : 'u-tabs-list';
  tabList.setAttribute('role', 'tablist');

  const panels = document.createElement('div');
  panels.className = 'u-tabs-panels';

  const activate = (value, focus = false, notify = true) => {
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
    if (notify) emit(host, 'change', { value });
  };

  tabs.forEach((tab, index) => {
    const trigger = makeButton(tab.label, 'u-tab');
    trigger.dataset.value = tab.value;
    trigger.id =
      host.localName +
      '-tab-' +
      index +
      '-' +
      Math.random().toString(36).slice(2, 7);
    trigger.setAttribute('role', 'tab');
    trigger.addEventListener('click', () => activate(tab.value));
    trigger.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const current = tabs.findIndex(
        (item) => item.value === host.getAttribute('value'),
      );
      const next =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? tabs.length - 1
            : (current +
                (event.key === 'ArrowRight' ? 1 : -1) +
                tabs.length) %
              tabs.length;
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
  activate(
    tabs.some((tab) => tab.value === selected)
      ? selected
      : (tabs[0]?.value ?? ''),
    false,
    false,
  );
}
