const ElementBase = globalThis.HTMLElement ?? class {};

export const defaultObservedAttributes = [
  'checked', 'content', 'default-value', 'description', 'disabled', 'end',
  'end-label', 'fallback', 'for', 'headers', 'height', 'items', 'label', 'max',
  'min', 'multiple', 'name', 'open', 'options', 'orientation', 'placeholder',
  'pressed', 'required', 'rows', 'side', 'src', 'start', 'start-label', 'step',
  'tabs', 'title', 'trigger-text', 'type', 'value', 'variant', 'width',
];

export const bool = (element, name) =>
  element.hasAttribute(name) && element.getAttribute(name) !== 'false';

export const text = (element, name, fallback = '') =>
  element.getAttribute(name) ?? fallback;

export const parse = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const list = (value, fallback = []) => {
  const parsed = parse(value, fallback);
  return Array.isArray(parsed) ? parsed : fallback;
};

export const option = (value, index) =>
  typeof value === 'object' && value !== null
    ? {
        value: String(value.value ?? value.label ?? index),
        label: String(value.label ?? value.value ?? index),
        content: value.content == null ? '' : String(value.content),
      }
    : { value: String(value), label: String(value), content: '' };

export const makeButton = (label, className = 'u-button') => {
  const node = document.createElement('button');
  node.type = 'button';
  node.className = className;
  node.textContent = label;
  return node;
};

export const emit = (element, name, detail) =>
  element.dispatchEvent(
    new CustomEvent(name, { bubbles: true, composed: true, detail }),
  );

export const clear = (element, ...nodes) => element.replaceChildren(...nodes);

export const reflectAttribute = (element, name, value) => {
  element._reflecting = true;
  try {
    if (value === false || value == null) element.removeAttribute(name);
    else element.setAttribute(name, value === true ? '' : String(value));
  } finally {
    element._reflecting = false;
  }
};

export const fieldAttributes = (host, control) => {
  for (const name of ['name', 'min', 'max', 'step', 'placeholder']) {
    const value = host.getAttribute(name);
    if (value !== null) control.setAttribute(name, value);
  }
  control.disabled = bool(host, 'disabled');
  if (host.hasAttribute('required')) control.required = true;
};

export function defineUniversalElement(tagName, renderer, options = {}) {
  const registry = globalThis.customElements;
  const existing = registry?.get(tagName);
  if (existing) return existing;

  class UniversalElement extends ElementBase {
    static get observedAttributes() {
      return options.observed ?? defaultObservedAttributes;
    }

    connectedCallback() {
      if (this._initialText === undefined) {
        this._initialText = this.textContent?.trim() ?? '';
      }
      this.render();
    }

    attributeChangedCallback() {
      if (this.isConnected && !this._rendering && !this._reflecting) this.render();
    }

    get value() {
      return (
        this.querySelector('input, textarea, select')?.value ??
        this.getAttribute('value') ??
        ''
      );
    }

    set value(next) {
      this.setAttribute('value', String(next ?? ''));
    }

    render() {
      if (typeof document === 'undefined') return;
      this._rendering = true;
      try {
        renderer(this, { initialText: this._initialText ?? '' });
      } finally {
        this._rendering = false;
      }
    }
  }

  Object.assign(UniversalElement.prototype, options.methods ?? {});
  registry?.define(tagName, UniversalElement);
  return UniversalElement;
}
