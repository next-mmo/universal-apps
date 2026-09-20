import { createApp } from 'vue';

import App from './preview.vue';
import './style.css';

createApp(App).mount('#app');
window.parent.postMessage({ type: 'docs-preview-ready', framework: 'vue' }, '*');
