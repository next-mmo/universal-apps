import { mount } from 'svelte';

import Preview from './preview.svelte';
import './style.css';

mount(Preview, { target: document.getElementById('app')! });
window.parent.postMessage({ type: 'docs-preview-ready', framework: 'svelte' }, '*');
